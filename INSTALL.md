# INSTALL

## Environment variables

### front

  * __`APP_FOLDER`__
    * Description: used only when deploying on Clever Cloud to specify which folder to scan when building and deploying application
    * Example: `front`

  * __`API_URL`__
    * Description: base url for API calls to back application 
    * Example: `https://back.cleverapps.io`

  * __`HOST`__
    * Description: the host address that will be accessible to connections outside of the host machine 
    * Example: `0.0.0.0`

  * __`PORT`__
    * Description: the port on which the application will listen
    * Example: `8080`

  * __`GOOGLE_ANALYTICS_ID`__
    * Description: the Google Analytics UA id
    * Example: `UA-123456789-1`

#### How to use them in front
Environment variables are accessible in `front` application using [Nuxt env property](https://nuxtjs.org/api/configuration-env/).

### back

  * __`APP_FOLDER`__
    * Description: used only when deploying on Clever Cloud to specify which folder to scan when building and deploying application
    * Example: `back`

  * __`DATABASE_TYPE`__
    * Description: database type, can be `postgres` or `sqlite`
    * Example: `postgres`

  * __`DATABASE_NAME`__
    * Description: database name
    * Example: `my-db-name` (or `my-local-db.sqlite` when `DATABASE_TYPE` is `sqlite`)

  * __`DATABASE_HOST`__
    * Description: database host, **not needed when `DATABASE_TYPE` is `sqlite`**
    * Example: `postgres`

  * __`DATABASE_PORT`__
    * Description: database port, **not needed when `DATABASE_TYPE` is `sqlite`**
    * Example: `5432`

  * __`DATABASE_USERNAME`__
    * Description: database username, **not needed when `DATABASE_TYPE` is `sqlite`**
    * Example: `db-username`

  * __`DATABASE_PASSWORD`__
    * Description: database password, **not needed when `DATABASE_TYPE` is `sqlite`**
    * Example: `a-super-secret-password`

  * __`APP_ADMIN_USERNAME`__
    * Description: the admin account username
    * Example: `admin`

  * __`APP_ADMIN_ENCRYPTED_PASSWORD`__
    * Description: the admin account encrypted password using bcrypt algorithm
    * Example: `$2b$07$SDDjLEm68O13foewjfiowpef453g45ewg4ew53g4ew3`

  * __`APP_EMAIL_ORDER_NOTIFICATION_FROM`__
    * Description: the email address that will be used in the `from` field in the email order notification  
    * Example: `from@example.org`

  * __`APP_EMAIL_ORDER_NOTIFICATION_SUBJECT_PREFIX`__
    * Description: the subject prefix of the email order notification  
    * Example: `[TEST]`

  * __`APP_EMAIL_ORDER_NOTIFICATION_TO`__
    * Description: the email addresses that will be used in the `to` field in the email order notification, comma-separated  
    * Example: `to1@example.org,to2@example.org`

  * __`APP_PERSONAL_DATA_ENCRYPTION_KEY`__
    * Description: the 32 characters length AES encryption key that will be used to encrypt and decrypt personal data  
    * Example: `abcdefghijklmnopqrstuvwxyz123456`

  * __`APP_JWT_SECRET`__
    * Description: the JWT secret for admin authentication  
    * Example: `a-super-secret-jwt-secret`

  * __`PORT`__
    * Description: the port on which the application will listen
    * Example: `8080`

  * __`SMTP_HOST`__
    * Description: the smtp host used for sending order notification emails
    * Example: `smtp.gmail.com`

  * __`SMTP_PORT`__
    * Description: the smtp port used for sending order notification emails
    * Example: `587`

  * __`SMTP_USERNAME`__
    * Description: the smtp username used for sending order notification emails
    * Example: `smtp-username@gmail.com`

  * __`SMTP_PASSWORD`__
    * Description: the smtp password used for sending order notification emails
    * Example: `smtp-password`

  * __`SENTRY_DSN`__
    * Description: the Sentry DSN used to report crashes 
    * Example: `https://some-hash.ingest.sentry.io/some-id`

#### How to use them in back
Environment variables are accessible in `back` application using the `EnvironmentConfigService`, and are validated on startup using [Joi](https://github.com/hapijs/joi).
