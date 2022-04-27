(ns beherbergung.resolver.root.ngo-admin.add-user
  (:require [clojure.spec.alpha :as s]
            [specialist-server.type :as t]
            [beherbergung.auth.core :refer [auth+role->entity]]
            [beherbergung.model.auth :as auth]
            [beherbergung.model.ngo :as ngo]
            [beherbergung.model.login :as login]
            [beherbergung.auth.password.hash :refer [hash-password]]
            [beherbergung.auth.password.generate :refer [generate-password]]))

(defn is_ngo_admin? [db_ctx login:id]
  (let [{:keys [q_id]} db_ctx
        result (q_id '{:keys [login:id]
                       :find [login:id]
                       :where [[?e :admin true]
                               [?e :xt/spec :beherbergung.model.login/record]
                               [?e :xt/id login:id]]
                       :in [login:id]}
                     login:id)]
       (not-empty result)))

(s/fdef add_user
        :args (s/tuple map? (s/keys :req-un [::auth/auth
                                             ::login/mail]) map? map?)
        :ret ::login/password)

(defn add_user
  "add new user or reset password of existing user"
  [_node opt ctx _info]
  (let [{:keys [tx tx-fn-put tx-fn-call]} (:db_ctx ctx)
        [ngo:id login:id] (auth+role->entity ctx (:auth opt) ::ngo/record)]
       (when (and ngo:id
                  (is_ngo_admin? (:db_ctx ctx) login:id))
             (let [mail (:mail opt)
                   pw (generate-password)
                   pw:hash (hash-password pw)
                   new_login_id (str "login_" mail)]
                  (tx [[:xtdb.api/put {:xt/id new_login_id
                                       :xt/spec :beherbergung.model.login/record
                                       :mail mail
                                       :password-hash pw:hash}]])
                  (tx-fn-put :update-ngo-logins
                             '(fn [ctx eid new_login_id]
                                  (let [db (xtdb.api/db ctx)
                                        entity (xtdb.api/entity db eid)]
                                       [[:xtdb.api/put (update entity :beherbergung.model.login/login:ids conj new_login_id)]])))
                  (tx-fn-call :update-ngo-logins ngo:id new_login_id)
                  pw))))

(s/def ::add_user (t/resolver #'add_user))
