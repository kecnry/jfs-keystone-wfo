jfs

## Dependencies

see [installing node and npm on Ubuntu](https://tecadmin.net/install-latest-nodejs-npm-on-ubuntu/)

  * node
  * npm


## Serving locally

In the root directory, issue:

```
npm install
```

to install local dependencies, and then:

```
npm start
```

to create a local webserver running the site.


## Deploying

NOTE: if forking and deploying your own version, please replace the Google API key (in index.html as well as apiGoogleconfig.json) with your own (see [these instructions for maps](https://www.npmjs.com/package/react-geosuggest) and [these instructions for calendar](https://github.com/Insomniiak/react-google-calendar-api)) and the DarkSky API key in clock.jsx.

### GitHub pages

In the root directory, issue:

```
npm run deploy
```

will need to provide github username and password (api token) 2-3 times.  This
will build the website and commit and push to the `gh-pages` branch.  It may take
a few minutes before those changes then go live.


To serve to a separate URL, edit the entry in [CNAME](./public/CNAME), the value of homepage in [package.json](./package.json), and follow the [github instructions](https://help.github.com/articles/using-a-custom-domain-with-github-pages/) to use a custom domain for pointing the DNS to github pages.


## React

See the [React README](README_REACT.md) for more information.
