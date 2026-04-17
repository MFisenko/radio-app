const { onUpdate } = require('firebase-functions/v2/remoteConfig')
const { getMessaging } = require('firebase-admin/messaging')
const { initializeApp } = require('firebase-admin/app')

initializeApp()

/**
 * Fires whenever the Remote Config template is published.
 * Broadcasts a silent FCM data message to all subscribers so the
 * mobile app can immediately fetch + activate the new config.
 */
exports.onRemoteConfigUpdate = onUpdate(async (versionMetadata) => {
  console.log(
    'Remote Config updated to version:',
    versionMetadata.versionNumber,
    'by:',
    versionMetadata.updateUser?.email ?? 'unknown',
  )

  await getMessaging().send({
    topic: 'remote_config_updates',
    data: {
      type: 'remote_config_updated',
      version: String(versionMetadata.versionNumber),
    },
  })

  console.log('FCM broadcast sent to topic remote_config_updates')
})
