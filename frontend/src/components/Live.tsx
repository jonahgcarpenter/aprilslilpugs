const Live = () => {
  return (
    <div style={{ width: '100%', maxWidth: '960px', margin: '0 auto' }}>
      <iframe
        src="https://rtmp.jonahsserver.com"
        style={{
          width: '100%',
          height: '600px',
          border: 'none'
        }}
        title="RTMP Server"
      />
    </div>
  );
};

export default Live;