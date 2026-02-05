type PriceInput = {
  amount: number
  currencyCode: string
}

export const formatPrice = (amount: number, currencyCode = 'usd') => {

  const normalizedCurrency = currencyCode.toUpperCase()
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: normalizedCurrency
  }).format(amount)
}

export const resolveVariantPrice = (variant: any): PriceInput | null => {
  if (!variant) {
    return null
  }

  if (variant.calculated_price?.calculated_amount !== undefined) {
    return {
      amount: variant.calculated_price.calculated_amount,
      currencyCode: variant.calculated_price.currency_code || 'usd'
    }
  }

  const price = variant.prices?.[0]
  if (price?.amount !== undefined) {
    return {
      amount: price.amount,
      currencyCode: price.currency_code || 'usd'
    }
  }

  return null
}

export const getFinalPrice = (variant: any): PriceInput | null => {
  if (!variant) {
    return null
  }

  if (variant.calculated_price?.final_price !== undefined) {
    return {
      amount: variant.calculated_price.final_price,
      currencyCode: variant.calculated_price.currency_code || 'usd'
    }
  }

  return null
}

export const resolveLineItemPrice = (item: any): PriceInput | null => {
  if (!item) {
    return null
  }

  if (item.unit_price !== undefined) {
    return {
      amount: item.unit_price,
      currencyCode: item.currency_code || 'usd'
    }
  }

  return null
}
