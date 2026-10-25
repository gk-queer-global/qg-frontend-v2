# QueerGlobal Dev App

Version 2.0.0

FYI: This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). Final page routes tbd.

Bi-monthly meetings for the development team is held on Google Meet, every Tuesday evening at 8 pm EST.

---

## Project Status

As of 6/29/2023, Pages/Sections Currently Under Construction (% Completed):

- Homepage (60%)
- About (60%)
- Blog (links to blank page)
- Businesses? (30%)
- Donate (links to blank page)
- Events? (links to blank page)
- Gallery (links to blank page)
- Header/Footer (90% - Needs formatting/testing)
- Get Involved (links to blank page)
- Profile (links to blank page)
- Resources (links to blank page)
- Sign Up (links to blank page)
- Search (links to blank page)
- Social media links (100%)
- Support
- 404 Page (links to blank page)

---

## Design Resources
Here's a rough list of Adobe XD views of the main routes:

- "/" static ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/))
- "/about" static ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/a76a9981-a49a-4fe4-8efa-1519315b7cfb))
- "/blog" back-end ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/65b06185-34d2-47a5-8f49-fd04ded77df3)). Back-end data needed: All blog posts
- "/businesses" back-end ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/9a020f3a-4b71-42e5-8ff4-2c93f15ddb28)). Back-end data needed: All businesses
- "/contact-us" static ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/8875368e-2396-45c9-8ff1-b53624f6270f))
- "/donate" back-end ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/b1ac5c96-9327-4dd4-9b28-2c6fd810889b)). Back-end data needed: % data on where money has been allocated to for "Purchase web domain", "Volunteer engagement", "Software & Licenses"
- "/events" back-end ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/75f89bcd-5bea-4e94-8b6d-8cf5b1480934)). Back-end data needed: All events, third-party api key for calendar widget?
- "/gallery" back-end ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/c8cf5b5c-bd3a-41ac-af52-e8d69b55a55f)). Back-end data needed: All images and details of gallery items
- "/log-in" static ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/26d7d063-1df0-4c54-aba4-96292eafd5e3))
- "/profile" back-end ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/9966678f-a17e-4af1-bb6a-45568e955832)). Back-end data needed: public/private profile boolean, user's info, social links, business, cards ('pills' of info tags), friends, resources
- "/resources" static ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/7ca030ba-18dc-478f-b459-d0e27cc0140c))
- "/sign-up" static ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/bb2719eb-f74d-4b1a-8604-b332bf96bced))
- "/submit-artwork" static ([render](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/cb17dfbf-4fcc-400d-b061-b34ff2187d71))
- "\/*" Static catch-all leading to [404 page](https://xd.adobe.com/view/6f6af599-8eb6-46b5-8731-e4c09ddd587e-3a39/screen/cb813a97-4fea-462f-845a-d0a26597c82f)

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `REACT_APP_SENTRY_DSN` | No | When set, enables Sentry error reporting in the browser bundle. When unset, Sentry stays disabled and makes no network requests. Do not commit a DSN or other secrets to the repository. |

If your deployment uses a Content-Security-Policy, allow Sentry ingest endpoints in `connect-src` when this variable is set (for example `https://*.ingest.sentry.io`).

---

## Available Scripts

In the project directory, you can run `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Run `npm test` for info on [running tests](https://facebook.github.io/create-react-app/docs/running-tests)

Run `npm run build` for info on [deployment](https://facebook.github.io/create-react-app/docs/deployment). 

---

## Deployment

Info: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)
