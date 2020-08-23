export interface IXBundleConfig {
  /**
   * Application URL is useful as XBundle can be used to route to different part of your web/front-end application
   */
  appUrl?: string;
  /**
   * The ROOT_URL is the url of the API itself.
   */
  rootUrl?: string;
  welcomeMessage: string;
  /**
   * Feel free to customise your own logo using String.raw`{logo}`
   * You can generate your own here: http://patorjk.com/software/taag/
   */
  logo: string;
}
