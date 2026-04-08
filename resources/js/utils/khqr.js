import { BakongKHQR, IndividualInfo, MerchantInfo, khqrData } from 'bakong-khqr';

const CURRENCY_MAP = {
    KHR: khqrData.currency.khr,
    USD: khqrData.currency.usd,
};

function formatDynamicAmount(amountKhr, currencyMode, exchangeRate) {
    if (!amountKhr) {
        return undefined;
    }

    if (currencyMode === 'USD') {
        const usdRate = exchangeRate?.usd_to_khr || 4000;
        return Number((amountKhr / usdRate).toFixed(2));
    }

    return Math.round(amountKhr);
}

function normalizeString(value) {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function normalizeKhqrError(error) {
    const message = error?.message || String(error);

    if (message.includes('slice is not a function')) {
        return 'KHQR input is not a valid raw QR text string. Paste the full payload text that starts with 000201, not an image, link, or screenshot.';
    }

    return message;
}

function buildOptionalData(gateway, amountKhr, exchangeRate) {
    const optionalData = {
        currency: CURRENCY_MAP[gateway.currency_mode] || khqrData.currency.khr,
        accountInformation: normalizeString(gateway.account_information) || undefined,
        acquiringBank: normalizeString(gateway.acquiring_bank) || undefined,
        mobileNumber: normalizeString(gateway.phone_number) || undefined,
        billNumber: normalizeString(gateway.bill_number_prefix) || undefined,
        storeLabel: normalizeString(gateway.store_label) || undefined,
        terminalLabel: normalizeString(gateway.terminal_label) || undefined,
        purposeOfTransaction:
            normalizeString(gateway.purpose_of_transaction) || undefined,
        merchantCategoryCode:
            normalizeString(gateway.merchant_category_code) || '5999',
    };

    if (gateway.is_dynamic) {
        optionalData.amount = formatDynamicAmount(
            amountKhr,
            gateway.currency_mode,
            exchangeRate,
        );

        if (gateway.expiration_minutes) {
            optionalData.expirationTimestamp =
                Date.now() + gateway.expiration_minutes * 60 * 1000;
        }
    }

    return optionalData;
}

export function inspectKhqrPayload(payload) {
    const trimmedPayload = normalizeString(payload);

    if (!trimmedPayload) {
        return {
            ok: false,
            errors: ['No KHQR payload found.'],
        };
    }

    if (!trimmedPayload.startsWith('000201')) {
        return {
            ok: false,
            errors: [
                'KHQR payload must be raw text that starts with 000201. Do not paste a QR image, screenshot, or payment link.',
            ],
        };
    }

    return {
        ok: true,
        payload: trimmedPayload,
        decoded: null,
        source: 'uploaded_payload',
    };
}

export function buildGatewayKhqr(gateway, { amountKhr = null, exchangeRate = null } = {}) {
    if (!gateway?.supports_khqr) {
        return {
            ok: false,
            errors: ['KHQR preview is disabled for this provider.'],
        };
    }

    if (gateway.qr_mode === 'uploaded_payload') {
        return inspectKhqrPayload(gateway.khqr_payload);
    }

    const merchantName =
        normalizeString(gateway.account_name) ||
        normalizeString(gateway.display_name) ||
        'Merchant';
    const merchantCity = normalizeString(gateway.merchant_city) || 'Phnom Penh';
    const bakongAccountId =
        normalizeString(gateway.bakong_account_id) ||
        normalizeString(gateway.bakong_id);
    const optionalData = buildOptionalData(gateway, amountKhr, exchangeRate);

    if (!bakongAccountId) {
        return {
            ok: false,
            errors: ['Bakong Account ID is required for generated KHQR.'],
        };
    }

    try {
        const khqr = new BakongKHQR();
        let response;

        if (gateway.qr_mode === 'generated_merchant') {
            const merchantId = normalizeString(gateway.merchant_id);
            const acquiringBank = normalizeString(gateway.acquiring_bank);

            if (!merchantId || !acquiringBank) {
                return {
                    ok: false,
                    errors: [
                        'Merchant KHQR requires both Merchant ID and Acquiring Bank.',
                    ],
                };
            }

            const merchantInfo = new MerchantInfo(
                bakongAccountId,
                merchantName,
                merchantCity,
                merchantId,
                acquiringBank,
                optionalData,
            );

            response = khqr.generateMerchant(merchantInfo);
        } else {
            const individualInfo = new IndividualInfo(
                bakongAccountId,
                merchantName,
                merchantCity,
                optionalData,
            );

            response = khqr.generateIndividual(individualInfo);
        }

        if (response?.status?.code !== 0 || !response?.data?.qr) {
            return {
                ok: false,
                errors: [response?.status?.message || 'Failed to generate KHQR.'],
            };
        }

        const decoded = BakongKHQR.decode(response.data.qr);

        return {
            ok: true,
            payload: response.data.qr,
            decoded: decoded?.data || null,
            source: gateway.qr_mode,
        };
    } catch (error) {
        return {
            ok: false,
            errors: [normalizeKhqrError(error)],
        };
    }
}
