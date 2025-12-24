export class Redactor {
    static scrub(text: string): string {
        if (!text) return text;

        let scrubbed = text;

        // 1. Email Redaction
        scrubbed = scrubbed.replace(
            /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            '[EMAIL_REDACTED]'
        );

        // 2. Phone Redaction (Simple US/International patterns)
        // Matches (123) 456-7890, 123-456-7890, +1 123 456 7890
        scrubbed = scrubbed.replace(
            /(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
            '[PHONE_REDACTED]'
        );

        // 3. Credit Card (Luhn-like patterns - rudimentary)
        scrubbed = scrubbed.replace(
            /\b(?:\d[ -]*?){13,16}\b/g,
            '[CARD_REDACTED]'
        );

        // 4. SSN (US)
        scrubbed = scrubbed.replace(
            /\b\d{3}-\d{2}-\d{4}\b/g,
            '[SSN_REDACTED]'
        );

        return scrubbed;
    }
}
