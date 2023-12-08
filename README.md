<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

Many credit card providers provide optional offers (extra points, cash back, etc.) but they require you to log in to your account and manually activate them. This application utilizes YAML configuration files to customize it for nearly any use case. The configuration consists of 3 types:

- `app` - Defines the browser's data directory, the users, and accounts that should be processed.
- `user` - Defines user's data, including which accounts they apply to and the credentials.
- `account` - Defines the steps necessary to activate your offers.

## Installation

```bash
$ npm install
```

You will also need to download the `chrome-driver` off of selenium's site.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Configuration

The configuration is fully type-safe, if you provide an invalid value or config, it will tell you exactly where and what is invalid.

The configuration files are expected to follow this structure (though you are welcome to change the directories in `app.module.ts`):

```
config/
  app.yaml
  users/
    user1.yaml
    user2.yaml
    ...
  accounts/
    account1.yaml
    account2.yaml
    ...
```

### App

```yaml
userDataDirectory: $PATH_TO_DAT_DIRECTORY # Non-empty path-like string
users:
  - $USER_PROFILE_ID # Non-empty string
  - ...
accounts:
  - $ACCOUNT_NAME # None-empty string
  - ...
```

### User

```yaml
#user_id1.yaml
id: user_id1 # Non-empty string
accounts:
  - type: account_name_1
    credentials:
      type: basic # TOTP Credentials are on the TODO list
      username: my_username # Non-empty string
      password: my_password # Non-empty string
```

### Account

```yaml
#account_name_1.yaml
id: account_name1 # Non-empty string
url: http://some.url.com # URL
steps:
  -  # See Steps Section
```

#### Steps

There are 3 types of steps:

`single` - Performs actions on the selected element(s)
`forEach` - Performs actions on the selected element(s) then loops over a range of steps
`whileFound` - Performs actions on the selected elements(s) then continually performs the child steps until the element is not found

```yaml
type: single # One of the above types
name: Some description for logs # Non-empty string
timeout: 1000 # Integer, defaults to 5000
selector: { See Selector Below }
```

```yaml
type: forEach  # One of the above types
name: Some description for logs  # Non-empty string
timeout: 1000  # Integer, defaults to 5000
selector: {See Selector Below}
indexVariable: loopIndex  # Non-empty string to store the current index
loopCountVariable: loopCount  # Non-empty variable-path string to the variable containing the iteration count
selector: {See Selector below}
forEach:  # List of steps to perform on each iteration
```

```yaml
type: whileFound  # One of the above types
name: Some description for logs  # Non-empty string
timeout: 1000  # Integer, defaults to 5000
selector: {See Selector Below}
indexVariable: loopIndex  # Non-empty string to store the current index
count
selector: {See Selector below}
whileFound:  # List of steps to perform until the element is not found
```

#### Selector

```yaml
selector:
  cssSelector: "div.id > div > a:nth-child({index})" # Non-empty css-selector string
  isOptional: false # Boolean, if true will skip if not found, defaults to false
  select: all # all or first, determines whether to select all matching elements or the first
  templateReplacers: # Optional map of replacer strings to be replaced with variables in the cssSelector
    "{index}": loopIndex
  shadowRootCSSSelector: # Optiona, array of css selectors to navigate shadow roots
    - "div.btn" # CSS selector string for an element that is within the shadowRoot of the element found by the cssSelector field
  iFrameSelector: "iframe#logon" # Optional css selector to an iFrame that should be focused before locating elements
  actions: { See Actions } # List of actions to be performed on the element(s) found by the selector
```

#### Actions

```yaml
type: click
```

```yaml
type: sendkeys
send: password # Must be 'otp', 'username', 'password' or 'variable - if variable, must provide variablePath
variablePath: chase.cards.1.name # Variable path that has the value that should be send as text to the element
```

```yaml
type: count
templateReplacers: # Replacer text to variable paths to replace in the storeUnder field
storeUnder: chase.cards # Variable path to store the count of elements returned by the selector
variableName: count # The name of the variable to store the count - this would yield { chase: { cards: { count: 5 }}}
```

```yaml
type: text
templateReplacers:  # Replacer text to variable paths to replace in the storeUnder field
storeUnder: chase.cards  # Variable path to store the count of elements returned by the selector
regexCaptureGroups:  # Optional Map of variable name to the regex to extract the value
  offerName: "^[^,]+"  # This would be stored as {offerName: value}
  type: "^[^,]+"  # This would be stored as as {type: value}
stringify: "{offerName}-{type}" # Optional Build a string out of the regex capture groups
variableName: offers  # The key to store the element's text or the captured groups, this would yield { chase: { cards: {offers: { offerName: "blah" }}}}
templateReplacers:  # Like the selector field, however can be used to dynamically populate variables in the `storeUnder`
```

## Support

This project is MIT-licenced open source. Feel free to use it or not - but if you need support you're probably on your own. Feel free to submit PRs or report bugs and eventually I might get around to those.

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Teagan Glenn](https://github.com/Teagan42)
- Website - [https://blog.teagantotally.rocks](https://blog.teagantotally.rocks/)

## License

Nest is [MIT licensed](LICENSE).
