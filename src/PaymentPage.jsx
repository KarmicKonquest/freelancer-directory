import React from 'react';

function PaymentPage() {
    // Placeholder content for admin to fill in later
    const paymentDetails = {
        paypalLink: "Admin to add PayPal.me link or email here",
        upiId: "Admin to add UPI ID here (e.g., yourname@okhdfcbank)",
        cryptoAddress: {
            btc: "Admin to add BTC address here",
            eth: "Admin to add ETH address here",
            usdt: "Admin to add USDT (TRC20/ERC20) address here"
        },
        qrCodeUpi: "Admin to add link to UPI QR code image here",
        qrCodeCrypto: "Admin to add link to a general crypto QR code image if applicable"
    };

    return (
        <div className="container mx-auto py-12 px-4 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Support LancerPages & Unlock Contacts</h1>

            <div className="bg-white p-8 rounded-lg shadow-xl space-y-6 text-gray-700">
                <p className="text-center text-lg">
                    To get access to contact details for all listed freelancers for 1 year, please make a one-time payment.
                    This helps us maintain and improve the LancerPages directory.
                </p>

                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-3 text-indigo-600">Payment Options</h2>
                    <p className="mb-4 text-sm text-gray-600">After payment, please send a screenshot of your transaction and your LancerPages registered email (if any) to <strong className="font-medium">directoryhelperbot@gmail.com</strong> for verification and account activation. Access will be granted manually within 24-48 hours.</p>

                    {/* UPI Section */}
                    <div className="mb-6 p-4 border rounded-lg bg-indigo-50">
                        <h3 className="text-lg font-medium mb-2 text-indigo-700">UPI (India)</h3>
                        <p className="mb-1"><strong>Scan QR Code:</strong></p>
                        {paymentDetails.qrCodeUpi.startsWith("Admin to add") ? (
                            <p className="text-sm text-gray-500">{paymentDetails.qrCodeUpi}</p>
                        ) : (
                            <img src={paymentDetails.qrCodeUpi} alt="UPI QR Code" className="w-40 h-40 mb-2 border rounded"/>
                        )}
                        <p className="mb-1"><strong>Or pay to UPI ID:</strong> {paymentDetails.upiId}</p>
                    </div>

                    {/* PayPal Section */}
                    <div className="mb-6 p-4 border rounded-lg bg-sky-50">
                        <h3 className="text-lg font-medium mb-2 text-sky-700">PayPal (International)</h3>
                        <p><strong>Pay to:</strong> <a href={paymentDetails.paypalLink.startsWith("https://") ? paymentDetails.paypalLink : "#"} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">{paymentDetails.paypalLink}</a></p>
                    </div>

                    {/* Crypto Section */}
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-lg font-medium mb-2 text-gray-700">Cryptocurrency</h3>
                        {paymentDetails.qrCodeCrypto && !paymentDetails.qrCodeCrypto.startsWith("Admin to add") && (
                            <>
                                <p className="mb-1"><strong>Scan General QR Code (if available):</strong></p>
                                <img src={paymentDetails.qrCodeCrypto} alt="Crypto QR Code" className="w-40 h-40 mb-2 border rounded"/>
                            </>
                        )}
                        <p className="mb-1"><strong>BTC:</strong> {paymentDetails.cryptoAddress.btc}</p>
                        <p className="mb-1"><strong>ETH (ERC20):</strong> {paymentDetails.cryptoAddress.eth}</p>
                        <p><strong>USDT (TRC20 or ERC20):</strong> {paymentDetails.cryptoAddress.usdt}</p>
                        <p className="mt-2 text-xs text-gray-500">Please ensure you are sending to the correct network (e.g., TRC20 for USDT on Tron, ERC20 for USDT on Ethereum).</p>
                    </div>
                </div>

                <p className="text-center mt-8 text-sm text-gray-600">
                    Thank you for supporting LancerPages!
                </p>
            </div>
        </div>
    );
}

export default PaymentPage;
