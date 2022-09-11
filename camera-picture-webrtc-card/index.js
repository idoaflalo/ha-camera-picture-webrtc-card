import { LitElement, html, css } from "https://unpkg.com/lit-element@2.0.1/lit-element.js?module";

class CameraPictureWebRTCcard extends LitElement {
  static get properties() {
    return {
      config: {},
      helpers: {},
      live: false,
      initialized: false,
    };
  }

  constructor() {
    super();
    if (!window.liveCameraCallback) {
      window.liveCameraCallback = [];
    }
    this._callback = null;
    this._element = null;
    this.loadCardHelpers();
  }

  attributeChangedCallback(name) {
    if (name == "hass" && !this.hass) {
      this.requestUpdate();
    }
  }

  render() {
    if (!this.config || !this.hass || !this.helpers) {
      return html``;
    }

    const config = this.live
      ? {
          type: "custom:webrtc-camera",
          entity: this.config.entity,
          ui: true,
          card_mod: {
            style: `
                video {
                  aspect-ratio: 16/9;
                  object-fit: fill;
                }
            `,
          },
        }
      : {
          title: this.config.title,
          type: "picture-glance",
          camera_view: "auto",
          entities: [],
          camera_image: this.config.entity,
          tap_action: "none",
          hold_action: "none",
          double_tap_action: "none",
          card_mod: {
            style: {
              ".": `
                div.box {
                  justify-content: center;
                }
              `,
              "hui-image$": `
                  img {
                    aspect-ratio: 16/9;
                    object-fit: fill;
                  }
              `,
            },
          },
        };
    const element = this.helpers.createCardElement(config);
    element.hass = this.hass;
    return html`<div class="container">${element}${!this.live ? this.playButton() : this.backButton()}</div>`;
  }

  enableLive() {
    this.live = true;
    this.notifyOthers();
    this.addCallback();
  }

  disableLive() {
    this.live = false;
    this.removeCallback();
  }

  notifyOthers() {
    if (window.liveCameraCallback.length >= 2) {
      window.liveCameraCallback.slice(0, window.liveCameraCallback.length - 1).forEach((callback) => callback());
    }
  }

  addCallback() {
    this._callback = this.disableLive.bind(this);
    window.liveCameraCallback.push(this._callback);
  }

  removeCallback() {
    window.liveCameraCallback = window.liveCameraCallback.filter((callback) => callback !== this._callback);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (!window.liveCameraCallback) {
      this.removeCallback();
    }
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error("You need to define entity");
    }
    if (!config.title) {
      throw new Error("You need to define a title");
    }

    this.config = config;
  }

  getCardSize() {
    return 1;
  }

  static get styles() {
    return css`
      .container {
        position: relative;
        aspect-ratio: 16/9;
        object-fit: fill;
      }
      .play-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
      }
      .play-button {
        cursor: pointer;
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12%;
        fill: #ffffffaa;
        transform: translate(-50%, -70%);
        background: #00000047;
        border-radius: 50%;
      }
      .back-container {
        position: absolute;
        top: 5px;
        left: 5px;
        background: #00000047;
        border-radius: 50%;
        width: var(--mdc-icon-size, 24px);
        height: var(--mdc-icon-size, 24px);
      }
      .back-button {
        cursor: pointer;
        fill: white;
      }
    `;
  }

  async loadCardHelpers() {
    this.helpers = await window.loadCardHelpers();
  }

  playButton() {
    return html`
      <div class="play-container" @click="${this.enableLive}">
        <svg
          class="play-button"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 485 485"
          xml:space="preserve"
        >
          <g>
            <path
              d="M413.974,71.026C368.171,25.225,307.274,0,242.5,0S116.829,25.225,71.026,71.026C25.225,116.829,0,177.726,0,242.5   s25.225,125.671,71.026,171.474C116.829,459.775,177.726,485,242.5,485s125.671-25.225,171.474-71.026   C459.775,368.171,485,307.274,485,242.5S459.775,116.829,413.974,71.026z M242.5,455C125.327,455,30,359.673,30,242.5 S125.327,30,242.5,30S455,125.327,455,242.5S359.673,455,242.5,455z"
            />
            <polygon points="181.062,336.575 343.938,242.5 181.062,148.425" />
          </g>
        </svg>
      </div>
    `;
  }
  backButton() {
    return html`<div class="back-container" @click="${this.disableLive}">
      <svg
        class="back-button"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        x="0px"
        y="0px"
        viewBox="0 0 384.97 384.97"
        xml:space="preserve"
      >
        <g>
          <g>
            <path
              d="M192.485,0C86.185,0,0,86.185,0,192.485C0,298.797,86.173,384.97,192.485,384.97S384.97,298.797,384.97,192.485 C384.97,86.185,298.797,0,192.485,0z M192.485,361.282c-92.874,0-168.424-75.923-168.424-168.797S99.611,24.061,192.485,24.061 s168.424,75.55,168.424,168.424S285.359,361.282,192.485,361.282z"
            />
            <path
              d="M235.878,99.876c-4.704-4.74-12.319-4.74-17.011,0l-83.009,84.2c-4.572,4.62-4.584,12.56,0,17.191l82.997,84.2 c4.704,4.74,12.319,4.74,17.011,0c4.704-4.752,4.704-12.439,0-17.191l-74.528-75.61l74.54-75.61 C240.57,112.315,240.57,104.628,235.878,99.876z"
            />
          </g>
        </g>
      </svg>
    </div> `;
  }
}

customElements.define("camera-picture-webrtc-card", CameraPictureWebRTCcard);
