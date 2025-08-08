Users
List genders

Example request:
curl --request GET \
    --get "https://qot.ug/api/genders" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (200):

Show headers

{
    "success": true,
    "message": null,
    "result": {
        "1": {
            "id": 1,
            "name": "MALE",
            "label": "Male",
            "title": "Mr."
        },
        "2": {
            "id": 2,
            "name": "FEMALE",
            "label": "Female",
            "title": "Mrs"
        }
    }
}

 
Request    Try it out ⚡   
GET api/genders

Headers
Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

Get gender

Example request:
curl --request GET \
    --get "https://qot.ug/api/genders/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (200):

Show headers

{
    "success": true,
    "message": null,
    "result": {
        "id": 1,
        "name": "MALE",
        "label": "Male",
        "title": "Mr."
    }
}

 
Request    Try it out ⚡   
GET api/genders/{id}

Headers
Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The gender's ID. Example: 1

List user types

Example request:
curl --request GET \
    --get "https://qot.ug/api/userTypes" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (200):

Show headers

{
    "success": true,
    "message": null,
    "result": {
        "2": {
            "id": 2,
            "name": "INDIVIDUAL",
            "label": "Individual"
        },
        "1": {
            "id": 1,
            "name": "PROFESSIONAL",
            "label": "Professional"
        }
    }
}

 
Request    Try it out ⚡   
GET api/userTypes

Headers
Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

Get user type

Example request:
curl --request GET \
    --get "https://qot.ug/api/userTypes/1" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (200):

Show headers

{
    "success": true,
    "message": null,
    "result": {
        "id": 1,
        "name": "PROFESSIONAL",
        "label": "Professional"
    }
}

 
Request    Try it out ⚡   
GET api/userTypes/{id}

Headers
Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user type's ID. Example: 1

List users

Example request:
curl --request GET \
    --get "https://qot.ug/api/users" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (403):

Show headers

{
    "success": false,
    "message": "Forbidden",
    "result": null
}

 
Request    Try it out ⚡   
GET api/users

Headers
Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

Get user
requires authentication

Example request:
curl --request GET \
    --get "https://qot.ug/api/users/3?embed=" \
    --header "Authorization: Bearer {YOUR_AUTH_KEY}" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (200):

Show headers

{
    "success": true,
    "message": null,
    "result": {
        "id": 3,
        "name": "User Demo",
        "username": null,
        "two_factor_enabled": false,
        "two_factor_method": "email",
        "updated_at": "2025-03-21T03:29:22.000000Z",
        "original_updated_at": "2025-03-21 03:29:22",
        "original_last_activity": "2025-03-21 03:54:02",
        "created_at_formatted": "May 1st, 2024 at 17:02",
        "photo_url": "https://qot.ug/storage/avatars/us/3/thumbnails/800x800-294656d3a1838c92a0c8d425dfac5a30.jpg",
        "p_is_online": false,
        "country_flag_url": "https://qot.ug/images/flags/circle/16/us.png"
    }
}

 
Request    Try it out ⚡   
GET api/users/{id}

Headers
Authorization      
Example: Bearer {YOUR_AUTH_KEY}

Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 3

Query Parameters
embed   string  optional  
Comma-separated list of the post relationships for Eager Loading - Possible values: country,userType,gender,countPostsViews,countPosts,countSavedPosts.

Store user

Example request:
curl --request POST \
    "https://qot.ug/api/users" \
    --header "Content-Type: multipart/form-data" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs" \
    --form "name=John Doe"\
    --form "country_code=US"\
    --form "auth_field=email"\
    --form "phone=+17656766467"\
    --form "phone_country="\
    --form "password=js!X07$z61hLA"\
    --form "accept_terms=1"\
    --form "email=john.doe@domain.tld"\
    --form "language_code=en"\
    --form "user_type_id=1"\
    --form "gender_id=1"\
    --form "phone_hidden="\
    --form "username=john_doe"\
    --form "password_confirmation=js!X07$z61hLA"\
    --form "disable_comments=1"\
    --form "create_from_ip=127.0.0.1"\
    --form "accept_marketing_offers="\
    --form "time_zone=America/New_York"\
    --form "captcha_key=ut"\
    --form "photo_path=@/private/var/folders/r0/k0xbnx757k3fnz09_6g9rp6w0000gn/T/php30aGaA" 
Request    Try it out ⚡   
POST api/users

Headers
Content-Type      
Example: multipart/form-data

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

Body Parameters
name   string   
The name of the user. Example: John Doe

country_code   string   
The code of the user's country. Example: US

auth_field   string   
The user's auth field ('email' or 'phone'). Example: email

phone   string  optional  
The mobile phone number of the user (Required when 'auth_field' value is 'phone'). Example: +17656766467

phone_country   string   
The user's phone number's country code (Required when the 'phone' field is filled).

password   string   
The user's password. Example: js!X07$z61hLA

accept_terms   boolean   
Field to allow user to accept or not the website terms. Example: true

email   string  optional  
The user's email address (Required when 'auth_field' value is 'email'). Example: john.doe@domain.tld

language_code   string  optional  
The code of the user's spoken language. Example: en

user_type_id   integer  optional  
The ID of user type. Example: 1

gender_id   integer  optional  
The ID of gender. Example: 1

photo_path   file  optional  
The file of user photo. Example: /private/var/folders/r0/k0xbnx757k3fnz09_6g9rp6w0000gn/T/php30aGaA

phone_hidden   boolean  optional  
Field to hide or show the user phone number in public. Example: false

username   string  optional  
The user's username. Example: john_doe

password_confirmation   string   
The confirmation of the user's password. Example: js!X07$z61hLA

disable_comments   boolean  optional  
Field to disable or enable comments on the user's listings. Example: true

create_from_ip   string   
The user's IP address. Example: 127.0.0.1

accept_marketing_offers   boolean  optional  
Field to allow user to accept or not marketing offers sending. Example: false

time_zone   string  optional  
The user's time zone. Example: America/New_York

captcha_key   string  optional  
Key generated by the CAPTCHA endpoint calling (Required when the CAPTCHA verification is enabled from the Admin panel). Example: ut

User's mini stats
requires authentication

Example request:
curl --request GET \
    --get "https://qot.ug/api/users/3/stats" \
    --header "Authorization: Bearer {YOUR_AUTH_TOKEN}" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (401):

Show headers

{
    "success": false,
    "message": "Unauthenticated or Token Expired, Please Login.",
    "result": null,
    "error": "Unauthenticated or Token Expired, Please Login."
}

 
Request    Try it out ⚡   
GET api/users/{id}/stats

Headers
Authorization      
Example: Bearer {YOUR_AUTH_TOKEN}

Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 3

Delete user's photo
requires authentication

Example request:
curl --request GET \
    --get "https://qot.ug/api/users/999999/photo/delete" \
    --header "Authorization: Bearer {YOUR_AUTH_TOKEN}" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Example response (401):

Show headers

{
    "success": false,
    "message": "Unauthenticated or Token Expired, Please Login.",
    "result": null,
    "error": "Unauthenticated or Token Expired, Please Login."
}

 
Request    Try it out ⚡   
GET api/users/{id}/photo/delete

Headers
Authorization      
Example: Bearer {YOUR_AUTH_TOKEN}

Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 999999

Update user's photo
requires authentication

Example request:
curl --request PUT \
    "https://qot.ug/api/users/999999/photo" \
    --header "Authorization: Bearer {YOUR_AUTH_TOKEN}" \
    --header "Content-Type: multipart/form-data" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs" \
    --form "latest_update_ip=127.0.0.1"\
    --form "photo_path=@/private/var/folders/r0/k0xbnx757k3fnz09_6g9rp6w0000gn/T/phpIM96b7" 
Request    Try it out ⚡   
PUT api/users/{id}/photo

Headers
Authorization      
Example: Bearer {YOUR_AUTH_TOKEN}

Content-Type      
Example: multipart/form-data

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 999999

Body Parameters
photo_path   file   
Must be a file. Must be at least 0 kilobytes. Must not be greater than 1500 kilobytes. Example: /private/var/folders/r0/k0xbnx757k3fnz09_6g9rp6w0000gn/T/phpIM96b7

latest_update_ip   string   
The user's IP address. Example: 127.0.0.1

Update user's preferences
requires authentication

Example request:
curl --request PUT \
    "https://qot.ug/api/users/999999/preferences" \
    --header "Authorization: Bearer {YOUR_AUTH_TOKEN}" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs" \
    --data "{
    \"disable_comments\": true,
    \"latest_update_ip\": \"127.0.0.1\",
    \"accept_terms\": true,
    \"accept_marketing_offers\": false,
    \"time_zone\": \"America\\/New_York\"
}"
Request    Try it out ⚡   
PUT api/users/{id}/preferences

Headers
Authorization      
Example: Bearer {YOUR_AUTH_TOKEN}

Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 999999

Body Parameters
disable_comments   boolean  optional  
Field to disable or enable comments on the user's listings. Example: true

latest_update_ip   string   
The user's IP address. Example: 127.0.0.1

accept_terms   boolean   
Field to allow user to accept or not the website terms. Example: true

accept_marketing_offers   boolean  optional  
Field to allow user to accept or not marketing offers sending. Example: false

time_zone   string  optional  
The user's time zone. Example: America/New_York

Update the user's theme preference

Example request:
curl --request PUT \
    "https://qot.ug/api/users/999999/save-theme-preference" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs" \
    --data "{
    \"theme\": \"light, dark or system\"
}"
Request    Try it out ⚡   
PUT api/users/{id}/save-theme-preference

Headers
Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 999999

Body Parameters
theme   string   
The user's theme preference value. Example: light, dark or system

Update user
requires authentication

Example request:
curl --request PUT \
    "https://qot.ug/api/users/999999" \
    --header "Authorization: Bearer {YOUR_AUTH_TOKEN}" \
    --header "Content-Type: multipart/form-data" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs" \
    --form "name=John Doe"\
    --form "auth_field=email"\
    --form "phone=+17656766467"\
    --form "phone_country="\
    --form "username=john_doe"\
    --form "email=john.doe@domain.tld"\
    --form "country_code=US"\
    --form "language_code=en"\
    --form "user_type_id=1"\
    --form "gender_id=1"\
    --form "remove_photo=0"\
    --form "phone_hidden="\
    --form "password=js!X07$z61hLA"\
    --form "password_confirmation=js!X07$z61hLA"\
    --form "disable_comments=1"\
    --form "latest_update_ip=127.0.0.1"\
    --form "accept_terms=1"\
    --form "accept_marketing_offers="\
    --form "time_zone=America/New_York"\
    --form "photo_path=@/private/var/folders/r0/k0xbnx757k3fnz09_6g9rp6w0000gn/T/phpmvGpqB" 
Request    Try it out ⚡   
PUT api/users/{id}

Headers
Authorization      
Example: Bearer {YOUR_AUTH_TOKEN}

Content-Type      
Example: multipart/form-data

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 999999

Body Parameters
name   string   
The name of the user. Example: John Doe

auth_field   string   
The user's auth field ('email' or 'phone'). Example: email

phone   string  optional  
The mobile phone number of the user (Required when 'auth_field' value is 'phone'). Example: +17656766467

phone_country   string   
The user's phone number's country code (Required when the 'phone' field is filled).

username   string  optional  
The user's username. Example: john_doe

email   string   
The user's email address (Required when 'auth_field' value is 'email'). Example: john.doe@domain.tld

country_code   string   
The code of the user's country. Example: US

language_code   string  optional  
The code of the user's spoken language. Example: en

user_type_id   integer  optional  
The ID of user type. Example: 1

gender_id   integer  optional  
The ID of gender. Example: 1

photo_path   file  optional  
The file of user photo. Example: /private/var/folders/r0/k0xbnx757k3fnz09_6g9rp6w0000gn/T/phpmvGpqB

remove_photo   integer  optional  
Enable the user photo removal ('0' or '1'). When its value is '1' the user's photo file will be removed and the 'photo_path' column will be empty. Example: 0

phone_hidden   boolean  optional  
Field to hide or show the user phone number in public. Example: false

password   string   
The user's password. Example: js!X07$z61hLA

password_confirmation   string   
The confirmation of the user's password. Example: js!X07$z61hLA

disable_comments   boolean  optional  
Field to disable or enable comments on the user's listings. Example: true

latest_update_ip   string   
The user's IP address. Example: 127.0.0.1

accept_terms   boolean   
Field to allow user to accept or not the website terms. Example: true

accept_marketing_offers   boolean  optional  
Field to allow user to accept or not marketing offers sending. Example: false

time_zone   string  optional  
The user's time zone. Example: America/New_York

Delete user
requires authentication

Example request:
curl --request DELETE \
    "https://qot.ug/api/users/999999" \
    --header "Authorization: Bearer {YOUR_AUTH_TOKEN}" \
    --header "Content-Type: application/json" \
    --header "Accept: application/json" \
    --header "Content-Language: en" \
    --header "X-AppApiToken: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=" \
    --header "X-AppType: docs"
Request    Try it out ⚡   
DELETE api/users/{id}

Headers
Authorization      
Example: Bearer {YOUR_AUTH_TOKEN}

Content-Type      
Example: application/json

Accept      
Example: application/json

Content-Language      
Example: en

X-AppApiToken      
Example: RFI3M0xVRmZoSDVIeWhUVGQzdXZxTzI4U3llZ0QxQVY=

X-AppType      
Example: docs

URL Parameters
id   integer   
The user's ID. Example: 999999

