//
// Copyright 2018 by The Gardener Authors.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const config = require('../../config')
const { InternalServerError, Forbidden } = require('../../errors')

const verifySignature = function (req, res, next) {
  const webhookSecret = _.get(config, 'gitHub.webhookSecret')
  if (!webhookSecret) {
    throw new InternalServerError('gitHub.webhookSecret not configured on dashboard backend')
  }
  const hmac = crypto.createHmac('sha1', webhookSecret)
  if (req.body) {
    const payloadBody = req.body
    hmac.update(payloadBody)
  }
  const requestSignature = _.get(req.headers, 'x-hub-signature')

  const signature = 'sha1=' + hmac.digest('hex')

  const equal = crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(requestSignature))
  if (!equal) {
    throw new Forbidden('Signatures didn\'t match!')
  } else {
    next()
  }
}
exports.verifySignature = verifySignature
