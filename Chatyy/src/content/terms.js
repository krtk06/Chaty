// Terms & Conditions content.
// Replace the placeholder contact details and company name before publishing:
// `contactEmail`, `companyName` and `lastUpdated`.

export const lastUpdated = 'October 2026'
export const companyName = 'Chaty'
export const contactEmail = 'support@chaty.app'

export const terms = {
  title: 'Terms & Conditions',
  updated: lastUpdated,
  companyName,
  contactEmail,
  intro:
    'These terms govern your use of Chaty, the AI chat and image generation service. By creating an account or using the service you agree to them. If you do not agree, do not use the service.',

  sections: [
    {
      heading: '1. Acceptance',
      paragraphs: [
        'By registering, logging in or otherwise using the service you agree to these terms and to our Privacy Policy. If you are using the service on behalf of an organisation, you confirm you have authority to bind that organisation.',
      ],
    },
    {
      heading: '2. Accounts',
      paragraphs: [
        'You need an account to use the service. You are responsible for keeping your credentials secure and for all activity that happens under your account. You must be at least 13 years old (or the age of digital consent in your country) to create an account.',
        'We may suspend or close accounts that are used to abuse the service, to circumvent credit limits, or to violate these terms.',
      ],
    },
    {
      heading: '3. Credits, plans and payments',
      list: [
        'The service is metered in credits. A text message costs 1 credit, an image or document request costs 2 credits.',
        'Credits are bought through our payment provider (Stripe) and are added to your account after a successful payment.',
        'Credits have no cash value, cannot be exchanged for money, and cannot be transferred or resold.',
        'Prices include any applicable taxes unless stated otherwise. We may change pricing, and existing balances keep the value they had when purchased.',
        'Refunds are handled according to the plan you bought and applicable law. Once credits are spent on generated content they cannot be refunded.',
      ],
    },
    {
      heading: '4. AI output',
      paragraphs: [
        'Responses and images are produced by third-party machine learning models. Output is generated automatically, may be inaccurate, and may be similar to output produced for other users.',
        'We do not guarantee that any output is correct, unique, safe or suitable for a particular purpose, and the service is not a substitute for professional advice.',
        'You are responsible for reviewing output before relying on it, publishing it, or using it to make decisions.',
      ],
    },
    {
      heading: '5. Community and published content',
      paragraphs: [
        'You can choose to publish generated images to the community gallery. By publishing you grant us a non-exclusive, worldwide, royalty-free licence to display, store and promote that image for as long as it remains published.',
        'You keep ownership of the prompts you submit and the images generated from them, to the extent permitted by law and by the underlying model providers.',
        'We may remove published content that violates these terms, that is unlawful, or that we are required to remove.',
      ],
    },
    {
      heading: '6. Acceptable use',
      list: [
        'Do not use the service for illegal activity, or to generate content that is illegal, defamatory, or that infringes someone else rights.',
        'Do not generate sexual content involving minors, content that promotes self-harm or violence, or content that impersonates real people.',
        'Do not attempt to reverse engineer, overload, scrape or circumvent the credit system or any technical limitation.',
        'Do not upload documents you are not allowed to process, including confidential material you have no right to share with a third party.',
      ],
    },
    {
      heading: '7. Your content',
      paragraphs: [
        'You keep all rights in the prompts and documents you submit. You grant us the limited licence needed to run the models, store your chats and deliver the results back to you.',
        'You confirm that you have the rights to everything you submit, and that submitting it does not infringe any third party right.',
      ],
    },
    {
      heading: '8. Third-party services',
      paragraphs: [
        'The service relies on third-party providers for model inference, image generation, hosting, storage and payments. Their availability affects ours, and their terms also apply to the content they process.',
        'Links to third-party sites are provided for convenience. We are not responsible for their content or privacy practices.',
      ],
    },
    {
      heading: '9. Termination',
      paragraphs: [
        'You can stop using the service and delete your account at any time. We may suspend or terminate access for breach of these terms, or where required by law.',
        'On termination, unused credits are handled as described in the refund terms above.',
      ],
    },
    {
      heading: '10. Disclaimers',
      paragraphs: [
        'The service is provided "as is" and "as available", without warranties of any kind, whether express or implied, including fitness for a particular purpose and non-infringement.',
        'We do not warrant that the service will be uninterrupted, error free, or that output will be free of harmful or inaccurate content.',
      ],
    },
    {
      heading: '11. Limitation of liability',
      paragraphs: [
        'To the maximum extent permitted by law, we are not liable for indirect, incidental, special or consequential damages, or for lost profits, data or goodwill, arising from your use of the service.',
        'Our total liability for claims relating to the service is limited to the amount you paid us in the twelve months before the claim.',
      ],
    },
    {
      heading: '12. Changes',
      paragraphs: [
        'We may update these terms. Material changes are announced in the product and take effect when published. Continuing to use the service after that means you accept the updated terms.',
      ],
    },
    {
      heading: '13. Contact',
      paragraphs: [
        `Questions about these terms can be sent to ${contactEmail}.`,
      ],
    },
  ],
}
