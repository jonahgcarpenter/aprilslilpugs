package models

type Settings struct {
	ID              int  `json:"id"`
	WaitlistEnabled bool `json:"waitlist_enabled" form:"waitlist_enabled"`
	StreamEnabled   bool `json:"stream_enabled" form:"stream_enabled"`
	StreamDown      bool `json:"stream_down" form:"stream_down"`
}
