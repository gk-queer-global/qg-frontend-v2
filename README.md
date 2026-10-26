# qg-frontend-v2

This is the intended Queer Global web app. There is no public website yet.

- **Docs:** [qg-docs](https://github.com/gk-queer-global/qg-docs)

## Run locally

```bash
npm install
npm start
```

Create React App with React 17 and `react-scripts` 5. Use Node 20 or newer (`engines` in package.json; CI runs on Node 20 and 22).

## Status

| Route | State |
| --- | --- |
| `/` Home | Has UI |
| `/about` | Has copy; image placeholders remain |
| `/donate`, `/blog`, `/profile`, `/search`, `/add-resource`, `/logout` | Heading stubs |
| `/resources`, `/get-involved`, `/contact-us`, and other nav/footer hrefs | Linked, no route |

There is no backend. The mobile nav `GET /user` call does not hit a real API.
