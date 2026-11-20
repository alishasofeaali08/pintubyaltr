const STORAGE_KEY = 'pintu.paymentMethods'
export const PAYMENT_OPTIONS = ['Visa', 'Mastercard', 'FPX', "Touch 'n Go eWallet", 'GrabPay', 'DuitNow QR', 'Boost', 'ShopeePay']

export function getPaymentSettings(userId) {
  try {
    const value = JSON.parse(localStorage.getItem(`${STORAGE_KEY}.${userId}`) || '{}')
    return {
      enabled: Array.isArray(value.enabled) ? value.enabled.filter((item) => PAYMENT_OPTIONS.includes(item)) : [],
      cards: Array.isArray(value.cards) ? value.cards : [],
      preferred: value.preferred || '',
    }
  } catch { return { enabled: [], cards: [], preferred: '' } }
}

export function savePaymentSettings(userId, settings) {
  localStorage.setItem(`${STORAGE_KEY}.${userId}`, JSON.stringify(settings))
}
