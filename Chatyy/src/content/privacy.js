// Privacy Policy content.
// Replace the placeholder contact details and company name before publishing:
// `contactEmail`, `companyName` and `lastUpdated`.

export const lastUpdated = 'October 2026'
export const companyName = 'Chaty'
export const contactEmail = 'support@chaty.app'

export const privacy = {
  title: 'Privacy Policy',
  updated: lastUpdated,
  companyName,
  contactEmail,
  intro:
    'This policy explains what we collect, why we collect it and what we do with it. It covers the Chaty web app, our accounts and our APIs.',

  sections: [
    {
      heading: '1. What we collect',
      list: [
        'Account data: your name, email address, sign-in provider, avatar colour and password hash (passwords are stored hashed, never in plain text).',
        'Billing data: your purchase history, plan and amount. Full card details are handled by our payment provider and never reach our servers.',
        'Content you create: the chats, prompts, uploaded documents and generated images stored in your account so the service can work.',
        'Usage data: credits consumed, request timings and error records, used to run and improve the service.',
        'Technical data: IP address, browser and device type, and pages visited, collected through server logs and analytics.',
      ],
    },
    {
      heading: '2. Why we use it',
      list: [
        'To provide the service: authenticating you, storing your chats, generating responses and images, and tracking credits.',
        'To take payment and issue receipts for credit purchases.',
        'To keep the service secure, prevent abuse and enforce our Terms.',
        'To understand which features are used and to fix errors before they become a problem.',
        'To send service messages about your account, credits and important changes.',
      ],
    },
    {
      heading: '3. Third-party processors',
      paragraphs: [
        'We share only what is needed to run the features you use, with these providers:',
      ],
      list: [
        'Model inference: our AI provider processes your prompts and documents to produce replies.',
        'Image generation: our image provider processes prompts to produce images, and hosts the result.',
        'Payments: our payment processor handles card details and confirms transactions.',
        'Sign-in: if you use Google or Apple sign-in, that provider shares your name, email and profile identifier with us.',
        'Infrastructure: our database and hosting provider store your account data and chats.',
      ],
      paragraph2:
        'Each processor acts under its own privacy terms. We do not sell your personal data, and we do not use your chats to train third-party models without an explicit opt-in.',
    },
    {
      heading: '4. Cookies and local storage',
      paragraphs: [
        'We use a session token in browser storage to keep you signed in, and we store your theme and sidebar preferences locally so the interface behaves the way you left it. We do not use advertising cookies or cross-site tracking pixels.',
      ],
    },
    {
      heading: '5. How we share information',
      list: [
        'With the processors listed above, to operate the service.',
        'With authorities where disclosure is required by law, or to protect our rights, users or the service.',
        'As part of a corporate transaction, such as a merger or sale, where the same protections continue to apply.',
      ],
    },
    {
      heading: '6. Retention',
      paragraphs: [
        'Your chats and generated images stay in your account until you delete them. If you close your account we delete your personal data within 30 days, except records we must keep for tax, fraud prevention or legal compliance.',
      ],
    },
    {
      heading: '7. Security',
      paragraphs: [
        'Passwords are hashed, traffic is encrypted in transit, and access to production data is limited to the people who need it. No system is perfectly secure, and we ask you to use a unique password and to tell us if you think your account has been compromised.',
      ],
    },
    {
      heading: '8. Your rights',
      paragraphs: [
        'Depending on where you live, you may have the right to access, correct, export or delete your personal data, to object to certain processing, and to withdraw consent. You can do most of this yourself in Settings, and we will respond to any remaining request within 30 days.',
        'If you are in the EEA or the UK, you can also complain to your local data protection authority.',
      ],
    },
    {
      heading: '9. Children',
      paragraphs: [
        'The service is not directed at children under 13, and we do not knowingly collect their personal data. If you believe a child has provided us with personal data, contact us and we will delete it.',
      ],
    },
    {
      heading: '10. International transfers',
      paragraphs: [
        'Our providers process data in other countries. Where data leaves your country, we rely on standard contractual clauses or an equivalent safeguard.',
      ],
    },
    {
      heading: '11. Changes to this policy',
      paragraphs: [
        'We update this policy when our practices change. The current version is always published here with its last updated date.',
      ],
    },
    {
      heading: '12. Contact',
      paragraphs: [
        `Privacy questions and data requests can be sent to ${contactEmail}.`,
      ],
    },
  ],
}
