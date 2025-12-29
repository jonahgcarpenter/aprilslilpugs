package utils

import (
	"fmt"
	"net/smtp"

	"github.com/jonahgcarpenter/aprilslilpugs/server/internal/config"
)

func SendEmail(to []string, subject string, htmlBody string) error {
	cfg := config.Load()

	if cfg.EmailUser == "" || cfg.EmailPassword == "" {
		return fmt.Errorf("email credentials are not set")
	}

	auth := smtp.PlainAuth("", cfg.EmailUser, cfg.EmailPassword, cfg.EmailServiceHost)

	headers := make(map[string]string)
	headers["From"] = cfg.EmailUser
	headers["To"] = to[0]
	headers["Subject"] = subject
	headers["MIME-Version"] = "1.0"
	headers["Content-Type"] = "text/html; charset=\"UTF-8\""

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + htmlBody

	addr := fmt.Sprintf("%s:%s", cfg.EmailServiceHost, cfg.EmailServicePort)

	err := smtp.SendMail(addr, auth, cfg.EmailUser, to, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email: %v", err)
	}

	return nil
}
