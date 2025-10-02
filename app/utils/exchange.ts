import { Convert } from 'easy-currencies'

export function useCurrencyConverter() {
    const rates = ref<Record<string, number>>({})
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    // Cache converter instance
    let converter: any = null

    const fetchRates = async (baseCurrency = 'EUR') => {
        if (converter && rates.value[baseCurrency]) return converter

        isLoading.value = true
        error.value = null

        try {
            converter = await Convert().from(baseCurrency).fetch()
            rates.value[baseCurrency] = converter.rates || {}
            return converter
        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Failed to fetch rates'
            throw err
        } finally {
            isLoading.value = false
        }
    }

    const convertCurrency = async (
        amount: number,
        from = 'EUR',
        to = 'JPY'
    ) => {
        try {
            const convert = await fetchRates(from)
            const result = await convert.amount(amount).to(to);
            return result.toFixed(2).replace('.', ',');
        } catch (err) {
            console.error('Currency conversion failed:', err)
            throw err
        }
    }

    return {
        rates: readonly(rates),
        isLoading: readonly(isLoading),
        error: readonly(error),
        convertCurrency,
        fetchRates
    }
}