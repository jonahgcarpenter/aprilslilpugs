# April's Lil Pugs

A custom, full-stack website built for [April's Lil Pugs](https://aprilslilpugs.com), tailored to manage dog breeding operations, puppy galleries, and customer interactions.

## Tech Stack

### Frontend

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State/Data Fetching:** [SWR](https://swr.vercel.app/)
- **Video Player:** [hls.js](https://github.com/video-dev/hls.js) (for live streaming)
- **Language:** TypeScript

### Backend

- **Language:** Go (Golang 1.25+)
- **Framework:** [Gin Gonic](https://github.com/gin-gonic/gin)
- **Database:** PostgreSQL
- **Authentication:** JWT
- **Live Reloading:** [Air](https://github.com/air-verse/air)

---

## Features

- **Breeder Management:** Admin tools to manage breeder profiles and "About Me" sections.
- **Dog & Litter Tracking:** Full CRUD capabilities for managing adult dogs, litters, and individual puppies.
- **Waitlist System:** Automated waitlist management for prospective owners.
- **Live Streaming:** Integrated live stream viewer for puppy cams (HLS support).
- **Gallery:** Dynamic image gallery for past litters and available puppies.
- **Authentication:** Secure admin login to protect management routes.
