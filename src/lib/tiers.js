import { api } from './api'

export const TIERS = {
  Bronze: {
    price: 0,
    description: 'Enjoy essential PINTU features and community access.',
    benefits: [
      'Basic property listing visibility',
      'Access to PINTU community',
      'Standard community post visibility',
      'Access to public property events',
      'Basic property recommendations',
    ],
  },
  Silver: {
    price: 19.9,
    description: 'Unlock enhanced account features and priority enquiries.',
    benefits: [
      'All Bronze benefits',
      'Priority visibility for community posts',
      'One promotional pinned post opportunity',
      'Increased property listing exposure',
      'AI-powered property recommendations',
    ],
  },
  Gold: {
    price: 39.9,
    description: 'Enjoy premium property services and exclusive offers.',
    benefits: [
      'All Silver benefits',
      'More frequent pinned community posts',
      'Featured property advertisements',
      'Enhanced visibility across community pages',
      'Priority participation in PINTU events',
    ],
  },
  Platinum: {
    price: 69.9,
    description: 'Access premium support and exclusive membership benefits.',
    benefits: [
      'All Gold benefits',
      'Premium pinned community posts',
      'Featured advertisements across PINTU',
      'Maximum property listing exposure',
      'Advanced AI-powered advertising recommendations',
    ],
  },
}

export const TIER_ORDER = ['Bronze', 'Silver', 'Gold', 'Platinum']
export const STARTING_BALANCE = 0

export async function getWallet(limit = 5) {
  const wallet = await api.get('/wallet', { params: { limit } })
  return {
    balance: wallet.balance ?? STARTING_BALANCE,
    transactions: Array.isArray(wallet.transactions) ? wallet.transactions : [],
  }
}

export async function addFunds(amount) {
  const { balance } = await api.post('/wallet/topup', { amount })
  return { ok: true, balance }
}

export async function upgradeTier(tier) {
  const result = await api.post('/wallet/upgrade', { tier })
  return result
}

export async function getAllTransactions() {
  const { transactions } = await api.get('/wallet/transactions')
  return Array.isArray(transactions) ? transactions : []
}
