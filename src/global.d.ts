// Following property will be present only if the app is started from package. Used for logger logic.
declare namespace NodeJS {
  interface Process {
    pkg: boolean;
  }
}
