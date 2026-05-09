package stream

import (
	"context"
	"crypto/tls"
	"fmt"
	"log/slog"
	"net"
	"net/http"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/bluenviron/gohlslib/v2"
	hlscodecs "github.com/bluenviron/gohlslib/v2/pkg/codecs"
	"github.com/bluenviron/gortmplib"
	rtmpcodecs "github.com/bluenviron/gortmplib/pkg/codecs"
	"github.com/gin-gonic/gin"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/database"
	"github.com/jonahgcarpenter/aprilslilpugs/server/pkg/utils"
)

type Config struct {
	RTMPAddr      string
	RTMPSAddr     string
	RTMPSCertFile string
	RTMPSKeyFile  string
	StreamHost    string
	StreamKey     string
	HLSPublicPath string
}

type Status struct {
	Enabled            bool   `json:"enabled"`
	Live               bool   `json:"live"`
	PublisherConnected bool   `json:"publisher_connected"`
	PlaybackURL        string `json:"playback_url"`
	RTMPURL            string `json:"rtmp_url"`
	RTMPSURL           string `json:"rtmps_url"`
	RTMPSAvailable     bool   `json:"rtmps_available"`
	StreamKey          string `json:"stream_key"`
	LastError          string `json:"last_error"`
}

type Manager struct {
	mu                   sync.RWMutex
	cfg                  Config
	enabled              bool
	live                 bool
	publisherConnected   bool
	rtmpsAvailable       bool
	lastError            string
	rtmpListener         net.Listener
	rtmpsListener        net.Listener
	activePublisherConn  net.Conn
	activePublisherClose func()
	muxer                *gohlslib.Muxer
	hlsTrack             *gohlslib.Track
	publisherStartedAt   time.Time
	listenerWG           sync.WaitGroup
	lastEventLive        bool
}

var Global = &Manager{}

func Initialize(cfg Config) error {
	Global.mu.Lock()
	Global.cfg = cfg
	Global.mu.Unlock()

	enabled, err := getStreamEnabledFromDB()
	if err != nil {
		slog.Warn("stream: failed to restore enabled state", "error", err)
		return nil
	}

	if enabled {
		return Global.Enable()
	}

	return nil
}

func (m *Manager) Enable() error {
	m.mu.Lock()
	if m.enabled {
		m.mu.Unlock()
		return nil
	}

	if m.cfg.StreamKey == "" {
		m.lastError = "STREAM_KEY must be configured"
		m.mu.Unlock()
		return fmt.Errorf("stream key is required")
	}

	rtmpAddr := m.cfg.RTMPAddr
	rtmpsAddr := m.cfg.RTMPSAddr
	m.lastError = ""
	m.mu.Unlock()

	rtmpListener, err := net.Listen("tcp", rtmpAddr)
	if err != nil {
		m.setLastError(fmt.Sprintf("failed to start RTMP listener: %v", err))
		return err
	}

	var (
		rtmpsListener  net.Listener
		rtmpsAvailable bool
	)

	if m.cfg.RTMPSCertFile != "" && m.cfg.RTMPSKeyFile != "" {
		cert, certErr := tls.LoadX509KeyPair(m.cfg.RTMPSCertFile, m.cfg.RTMPSKeyFile)
		if certErr != nil {
			m.setLastError(fmt.Sprintf("RTMPS disabled: %v", certErr))
		} else {
			rtmpsListener, certErr = tls.Listen("tcp", rtmpsAddr, &tls.Config{Certificates: []tls.Certificate{cert}})
			if certErr != nil {
				rtmpListener.Close()
				m.setLastError(fmt.Sprintf("failed to start RTMPS listener: %v", certErr))
				return certErr
			}
			rtmpsAvailable = true
		}
	}

	m.mu.Lock()
	m.enabled = true
	m.rtmpListener = rtmpListener
	m.rtmpsListener = rtmpsListener
	m.rtmpsAvailable = rtmpsAvailable
	m.live = false
	m.publisherConnected = false
	m.mu.Unlock()

	m.listenerWG.Add(1)
	go m.acceptLoop("rtmp", rtmpListener)

	if rtmpsListener != nil {
		m.listenerWG.Add(1)
		go m.acceptLoop("rtmps", rtmpsListener)
	}

	slog.Info("stream: listeners started", "rtmp_addr", rtmpAddr, "rtmps_addr", rtmpsAddr, "rtmps_available", rtmpsAvailable)
	return nil
}

func (m *Manager) Disable() {
	m.mu.Lock()
	if !m.enabled {
		m.mu.Unlock()
		return
	}

	m.enabled = false
	m.live = false
	m.publisherConnected = false
	m.lastError = ""

	rtmpListener := m.rtmpListener
	rtmpsListener := m.rtmpsListener
	activeConn := m.activePublisherConn
	activeClose := m.activePublisherClose
	muxer := m.muxer

	m.rtmpListener = nil
	m.rtmpsListener = nil
	m.activePublisherConn = nil
	m.activePublisherClose = nil
	m.muxer = nil
	m.hlsTrack = nil
	m.publisherStartedAt = time.Time{}
	m.lastEventLive = false
	m.rtmpsAvailable = false
	m.mu.Unlock()

	if rtmpListener != nil {
		_ = rtmpListener.Close()
	}
	if rtmpsListener != nil {
		_ = rtmpsListener.Close()
	}
	if activeClose != nil {
		activeClose()
	}
	if activeConn != nil {
		_ = activeConn.Close()
	}
	if muxer != nil {
		muxer.Close()
	}

	m.listenerWG.Wait()
	m.fireStatusEvent(false)
	slog.Info("stream: listeners stopped")
}

func (m *Manager) Status() Status {
	m.mu.RLock()
	defer m.mu.RUnlock()

	return Status{
		Enabled:            m.enabled,
		Live:               m.live,
		PublisherConnected: m.publisherConnected,
		PlaybackURL:        m.cfg.HLSPublicPath,
		RTMPURL:            ingestURL("rtmp", m.cfg.StreamHost, m.cfg.RTMPAddr, m.cfg.StreamKey),
		RTMPSURL:           ingestURL("rtmps", m.cfg.StreamHost, m.cfg.RTMPSAddr, m.cfg.StreamKey),
		RTMPSAvailable:     m.rtmpsAvailable,
		StreamKey:          m.cfg.StreamKey,
		LastError:          m.lastError,
	}
}

func (m *Manager) HandleHLS(c *gin.Context) {
	m.mu.RLock()
	muxer := m.muxer
	live := m.live
	m.mu.RUnlock()

	if muxer == nil || !live {
		slog.Debug("stream: rejected HLS request", "path", c.Request.URL.Path, "live", live, "has_muxer", muxer != nil, "remote_addr", c.ClientIP())
		c.Status(http.StatusNotFound)
		return
	}

	slog.Debug("stream: serving HLS request", "path", c.Request.URL.Path, "remote_addr", c.ClientIP())
	c.Header("Cache-Control", "no-store")
	c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, "/hls")
	if c.Request.URL.Path == "" {
		c.Request.URL.Path = "/"
	}
	muxer.Handle(c.Writer, c.Request)
	if c.IsAborted() {
		return
	}
	c.Abort()
}

func (m *Manager) acceptLoop(protocol string, listener net.Listener) {
	defer m.listenerWG.Done()

	for {
		nconn, err := listener.Accept()
		if err != nil {
			m.mu.RLock()
			enabled := m.enabled
			m.mu.RUnlock()
			if enabled {
				slog.Warn("stream: accept failed", "protocol", protocol, "error", err)
			}
			return
		}

		slog.Debug("stream: accepted connection", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String())
		go m.handlePublisher(protocol, nconn)
	}
}

func (m *Manager) handlePublisher(protocol string, nconn net.Conn) {
	defer nconn.Close()

	slog.Info("stream: publisher connection opened", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String())

	conn := &gortmplib.ServerConn{RW: nconn}
	if err := conn.Initialize(); err != nil {
		slog.Warn("stream: failed to initialize publisher connection", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "error", err)
		return
	}

	slog.Debug("stream: publisher connection initialized", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String())

	if err := conn.Accept(); err != nil {
		slog.Warn("stream: failed to accept publisher connection", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "error", err)
		return
	}

	slog.Info("stream: publisher connection accepted", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "path", conn.URL.Path, "publish", conn.Publish)

	if !conn.Publish {
		m.setLastError("player connections are not supported on ingest ports")
		slog.Warn("stream: rejected non-publisher connection", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String())
		return
	}

	if !m.isAuthorizedPath(conn.URL.Path) {
		m.setLastError("publisher used an invalid stream path or key")
		slog.Warn("stream: rejected publisher with invalid path", "protocol", protocol, "path", conn.URL.Path)
		return
	}

	cleanup, err := m.claimPublisher(nconn)
	if err != nil {
		m.setLastError(err.Error())
		slog.Warn("stream: rejected extra publisher", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "error", err)
		return
	}
	defer cleanup()

	reader := &gortmplib.Reader{Conn: conn}
	if err := reader.Initialize(); err != nil {
		m.setLastError(fmt.Sprintf("failed to initialize stream reader: %v", err))
		slog.Warn("stream: failed to initialize reader", "protocol", protocol, "error", err)
		return
	}

	slog.Info("stream: reader initialized", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "path", conn.URL.Path, "track_count", len(reader.Tracks()), "tracks", describeTracks(reader.Tracks()))

	videoTrack, hlsCodec := findH264Track(reader.Tracks())
	if videoTrack == nil || hlsCodec == nil {
		m.setLastError("publisher must send an H264 video track")
		slog.Warn("stream: rejected publisher without H264 video", "protocol", protocol)
		return
	}

	muxer := &gohlslib.Muxer{
		Variant:            gohlslib.MuxerVariantMPEGTS,
		SegmentCount:       3,
		SegmentMinDuration: time.Second,
		Tracks: []*gohlslib.Track{{
			Codec:     hlsCodec,
			ClockRate: 90000,
		}},
		OnEncodeError: func(err error) {
			m.setLastError(fmt.Sprintf("failed to encode HLS segment: %v", err))
			slog.Warn("stream: HLS muxer encode error", "error", err)
		},
	}

	slog.Info("stream: starting HLS muxer", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "path", conn.URL.Path, "segment_count", muxer.SegmentCount, "segment_min_duration", muxer.SegmentMinDuration)

	if err := muxer.Start(); err != nil {
		m.setLastError(fmt.Sprintf("failed to start HLS muxer: %v", err))
		slog.Warn("stream: failed to start HLS muxer", "error", err)
		return
	}
	defer muxer.Close()

	slog.Info("stream: HLS muxer started", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "path", conn.URL.Path)

	m.attachMuxer(nconn, muxer, muxer.Tracks[0])

	var markedLive sync.Once
	frameCount := 0
	reader.OnDataH264(videoTrack, func(pts time.Duration, _ time.Duration, au [][]byte) {
		frameCount++
		au = normalizeH264AccessUnit(au, hlsCodec.SPS, hlsCodec.PPS)
		markedLive.Do(func() {
			slog.Info("stream: received first H264 access unit", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "path", conn.URL.Path, "pts", pts, "au_count", len(au))
			m.setPublisherLive(nconn)
		})

		if frameCount == 1 || frameCount%120 == 0 {
			slog.Debug("stream: writing H264 access unit", "protocol", protocol, "remote_addr", nconn.RemoteAddr().String(), "path", conn.URL.Path, "frame_count", frameCount, "pts", pts, "au_count", len(au))
		}

		if err := muxer.WriteH264(muxer.Tracks[0], time.Now(), durationToClockTicks(pts, 90000), au); err != nil {
			m.setLastError(fmt.Sprintf("failed to write HLS frame: %v", err))
			slog.Warn("stream: failed to write HLS frame", "error", err)
		}
	})

	slog.Info("stream: publisher connected", "protocol", protocol, "path", conn.URL.Path, "remote_addr", nconn.RemoteAddr().String())

	for {
		if err := reader.Read(); err != nil {
			m.setLastError(fmt.Sprintf("publisher disconnected: %v", err))
			slog.Info("stream: publisher disconnected", "protocol", protocol, "error", err)
			return
		}
	}
}

func (m *Manager) claimPublisher(nconn net.Conn) (func(), error) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if !m.enabled {
		return nil, fmt.Errorf("stream is disabled")
	}
	if m.activePublisherConn != nil {
		return nil, fmt.Errorf("a publisher is already connected")
	}

	m.activePublisherConn = nconn
	m.activePublisherClose = func() {
		_ = nconn.Close()
	}
	m.publisherConnected = true
	m.live = false
	m.publisherStartedAt = time.Now()
	m.lastError = ""

	slog.Info("stream: claimed publisher slot", "remote_addr", nconn.RemoteAddr().String(), "started_at", m.publisherStartedAt)

	return func() {
		m.releasePublisher(nconn)
	}, nil
}

func (m *Manager) attachMuxer(nconn net.Conn, muxer *gohlslib.Muxer, hlsTrack *gohlslib.Track) {
	m.mu.Lock()
	defer m.mu.Unlock()

	if m.activePublisherConn != nconn {
		muxer.Close()
		return
	}

	m.muxer = muxer
	m.hlsTrack = hlsTrack

	slog.Debug("stream: attached active muxer", "remote_addr", nconn.RemoteAddr().String())
}

func (m *Manager) setPublisherLive(nconn net.Conn) {
	m.mu.Lock()
	if m.activePublisherConn != nconn {
		m.mu.Unlock()
		return
	}

	wasLive := m.live
	m.live = true
	m.mu.Unlock()

	if !wasLive {
		slog.Info("stream: publisher marked live", "remote_addr", nconn.RemoteAddr().String())
		m.fireStatusEvent(true)
	}
}

func (m *Manager) releasePublisher(nconn net.Conn) {
	m.mu.Lock()
	if m.activePublisherConn != nconn {
		m.mu.Unlock()
		return
	}

	wasLive := m.live
	startedAt := m.publisherStartedAt
	m.activePublisherConn = nil
	m.activePublisherClose = nil
	m.publisherConnected = false
	m.live = false
	m.publisherStartedAt = time.Time{}
	muxer := m.muxer
	m.muxer = nil
	m.hlsTrack = nil
	m.mu.Unlock()

	if muxer != nil {
		muxer.Close()
	}

	slog.Info("stream: released publisher slot", "remote_addr", nconn.RemoteAddr().String(), "was_live", wasLive, "uptime", time.Since(startedAt))
	if wasLive {
		m.fireStatusEvent(false)
	}
}

func (m *Manager) isAuthorizedPath(rawPath string) bool {
	clean := strings.Trim(path.Clean(rawPath), "/")
	parts := strings.Split(clean, "/")
	if len(parts) != 2 {
		return false
	}

	return parts[0] == "live" && parts[1] == m.cfg.StreamKey
}

func (m *Manager) setLastError(msg string) {
	m.mu.Lock()
	m.lastError = msg
	m.mu.Unlock()
}

func (m *Manager) fireStatusEvent(isLive bool) {
	m.mu.Lock()
	if m.lastEventLive == isLive {
		m.mu.Unlock()
		return
	}
	m.lastEventLive = isLive
	m.mu.Unlock()

	go func() {
		payload := map[string]interface{}{
			"camera_name": "Puppy Cam",
		}

		if isLive {
			payload["status"] = "online"
			slog.Info("stream: back ONLINE")
		} else {
			payload["status"] = "offline"
			slog.Warn("stream: went OFFLINE")
		}

		if err := utils.SendAppEvent("stream_status", payload); err != nil {
			slog.Error("stream: failed to fire HA event", "error", err)
		}
	}()
}

func getStreamEnabledFromDB() (bool, error) {
	if database.Pool == nil {
		return false, nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var enabled bool
	err := database.Pool.QueryRow(ctx, "SELECT stream_enabled FROM settings WHERE id = 1").Scan(&enabled)
	if err != nil {
		return false, err
	}

	return enabled, nil
}

func ingestURL(scheme, host, addr, streamKey string) string {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return ""
	}

	return fmt.Sprintf("%s://%s:%s/live/%s", scheme, host, port, streamKey)
}

func durationToClockTicks(d time.Duration, clockRate int64) int64 {
	return d.Nanoseconds() * clockRate / int64(time.Second)
}

func findH264Track(tracks []*gortmplib.Track) (*gortmplib.Track, *hlscodecs.H264) {
	for _, track := range tracks {
		codec, ok := track.Codec.(*rtmpcodecs.H264)
		if ok {
			return track, &hlscodecs.H264{
				SPS: codec.SPS,
				PPS: codec.PPS,
			}
		}
	}

	return nil, nil
}

func normalizeH264AccessUnit(au [][]byte, sps []byte, pps []byte) [][]byte {
	if len(au) == 0 {
		return au
	}

	hasSPS := false
	hasPPS := false
	hasIDR := false
	for _, nalu := range au {
		if len(nalu) == 0 {
			continue
		}

		switch nalu[0] & 0x1F {
		case 7:
			hasSPS = true
		case 8:
			hasPPS = true
		case 5:
			hasIDR = true
		}
	}

	if !hasIDR || (hasSPS && hasPPS) {
		return au
	}

	normalized := make([][]byte, 0, len(au)+2)
	if !hasSPS && len(sps) > 0 {
		normalized = append(normalized, append([]byte(nil), sps...))
	}
	if !hasPPS && len(pps) > 0 {
		normalized = append(normalized, append([]byte(nil), pps...))
	}

	normalized = append(normalized, au...)
	return normalized
}

func describeTracks(tracks []*gortmplib.Track) []string {
	descriptions := make([]string, 0, len(tracks))
	for i, track := range tracks {
		descriptions = append(descriptions, fmt.Sprintf("track_%d=%T", i, track.Codec))
	}

	return descriptions
}
