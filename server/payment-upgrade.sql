ALTER TABLE ticket_orders
ADD COLUMN payment_token_hash CHAR(64) NULL AFTER payment_status;

ALTER TABLE mpesa_callbacks
ADD COLUMN attempt_count INT UNSIGNED NOT NULL DEFAULT 0,
ADD COLUMN next_attempt_at DATETIME NULL,
ADD COLUMN locked_until DATETIME NULL,
ADD COLUMN last_error VARCHAR(1000) NULL;

ALTER TABLE mpesa_callbacks
ADD UNIQUE KEY uq_callbacks_checkout (checkout_request_id),
ADD KEY idx_callbacks_recovery (processing_status, next_attempt_at, locked_until);
