export default class {
    constructor() {
        this.id = null;
        this.scope = [ "identify", "guilds", "guilds.join", "rpc" ];
        this.tokenType = null;
        this.redirectUri = `${location.origin}/auth/discord/redirect/`;
    }
    #secret_ = null;
    #token_ = null;
    #accessToken_ = null;
    #refreshToken_ = null;
    #events = new Map();
    ajax({ host, method = "GET", path, headers = { "Content-Type": "application/x-www-form-urlencoded" }, body }, callback = t => t) {
        return new Promise(function(resolve, reject) {
            try {
                const res = new XMLHttpRequest();
                res.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        resolve(callback(JSON.parse(this.responseText)));
                    }
                }
                res.open(method, `https://${host || "discord.com"}/api${path}`, true);
                for (const t in headers)
                    res.setRequestHeader(t, headers[t]);
                res.send(new URLSearchParams(body));
            } catch(e) {
                return reject(e);
            }
        });
    }
    on(event, func = function() {}) {
        if (!event || typeof event !== "string")
            throw new Error("INVALID_EVENT");
        this.#events.set(event, func.bind(this));
        return this;
    }
    emit(event, ...args) {
        if (!event || typeof event !== "string")
            throw new Error("INVALID_EVENT");
        event = this.#events.get(event);
        if (!event && typeof event !== "function")
            throw new Error("INVALID_FUNCTION");
        return event(...args);
    }
    handle() {
        setInterval(() => {
            this.refreshToken();
        }, 3e5);
    }
    login({ id, secret, token }) {
        if (id) this.id = id;
        if (secret) this.#secret_ = secret;
        if (token) this.#token = token;
        this.requestToken().then(() => {
            this.handle();
        });
        this.emit("ready");
        return this;
    }
    requestToken(code) {
        return this.ajax({
            path: "/oauth2/token",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: {
                client_id: this.id,
                client_secret: this.#secret_,
                grant_type: "authorization_code",
                code,
                redirect_uri: this.redirectUri,
                scope: this.scope.join(" ")
            },
            method: "post"
        }).then(t => {
            this.tokenType = t.token_type,
            this.#accessToken_ = t.access_token,
            this.#refreshToken_ = t.refresh_token;
            return t;
        });
    }
    refreshToken() {
        return this.ajax({
            path: "/oauth2/token",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: {
                client_id: this.id,
                client_secret: this.#secret_,
                grant_type: "refresh_token",
                refresh_token: this.#refreshToken_
            },
            method: "post"
        }).then(({ access_token, refresh_token, scope, token_type }) => {
            this.scope = scope.split(/\s+/g);
            this.tokenType = token_type;
            this.#accessToken_ = access_token;
            this.#refreshToken_ = refresh_token;
            return t;
        });
    }
    addMember({ guildId, userId, deaf, mute, nickname, roles, accessToken }) {
        return this.ajax({
            path: `/guilds/${guildId}/members/${userId}`,
			headers: {
                authorization: "Bot " + this.#botToken
            },
            body: {
                deaf,
                mute,
                nick: nickname,
                roles,
                access_token: accessToken,
            },
            method: "put"
		});
    }
    getUser() {
        return this.ajax({
            path: "/users/@me",
            headers: {
                "Authorization": `${this.tokenType} ${this.#accessToken_}`,
                "Content-Type": "application/json"
            }
        }).then(({ access_token, refresh_token, scope, token_type }) => {
            this.scope = scope.split(/\s+/g);
            this.tokenType = token_type;
            this.#accessToken_ = access_token;
            this.#refreshToken_ = refresh_token;
            return t;
        });
    }
    getGuilds() {
        return this.ajax({
            path: "/users/@me/guilds",
            headers: {
                "Authorization": `${this.tokenType} ${this.#accessToken_}`,
                "Content-Type": "application/json"
            }
        }).then(({ access_token, refresh_token, scope, token_type }) => {
            this.scope = scope.split(/\s+/g);
            this.tokenType = token_type;
            this.#accessToken_ = access_token;
            this.#refreshToken_ = refresh_token;
            return t;
        });
    }
    getConnections() {
        return this.ajax({
            path: "/users/@me/connections",
            headers: {
                "Authorization": `${this.tokenType} ${this.#accessToken_}`,
                "Content-Type": "application/json"
            }
        }).then(({ access_token, refresh_token, scope, token_type }) => {
            this.scope = scope.split(/\s+/g);
            this.tokenType = token_type;
            this.#accessToken_ = access_token;
            this.#refreshToken_ = refresh_token;
            return t;
        });
    }
    set #token(t) {
        let e = Array.from({ length: t.length }, () => Math.floor(Math.random() * 26));
        let i = "";
        for (const s in t)
            i += (t[s].charCodeAt(0) + e[s]) + `.${e[s].toString()}.`;
        this.#token_ = i;
    }
    get #token() {
        if (!this.#token_) return null;
        let t = this.#token_.split(/\.+/g);
        for (let e = 0; e in t; e += 2) {
            t[e] -= t[e + 1],
            delete t[e + 1];
        }
        return String.fromCharCode(...t.filter(t => t !== void 0));
    }
}