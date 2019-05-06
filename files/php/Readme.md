# Server source

## l/

- index.php

### Simple labelary.com https proxy script

[Labelary][1] provides an API to convert ZPL code to pdf on demand. Unfortunately
it is not accessible via https meaning the browser will refuse access to the
response when the request is fired from the Portal.

This script just accepts POST requests and forwards them to the Labelary API
endpoint, receives the response and returns it and so can be hosted on an https
enabled server to circumvent the issue.
