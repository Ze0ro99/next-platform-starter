// Initialize Pi SDK
let Pi;
let currentUser = null;

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        Pi = window.Pi;
        showStatus('جاري تحميل التطبيق...', 'info');

        // Initialize Pi SDK
        await Pi.init({
            version: '2.0',
            sandbox: true // Set to false for production
        });

        showStatus('تم تحميل التطبيق بنجاح!', 'success');
        console.log('Pi SDK initialized successfully');
    } catch (error) {
        console.error('Error initializing Pi SDK:', error);
        showStatus('خطأ في تحميل التطبيق. يرجى المحاولة مرة أخرى.', 'error');
    }
});

// Authenticate user with Pi Network
async function authenticateUser() {
    try {
        showStatus('جاري تسجيل الدخول...', 'info');

        const scopes = ['username', 'payments', 'wallet_address'];
        const authResult = await Pi.authenticate(scopes, onIncompletePaymentFound);

        currentUser = authResult.user;

        // Update UI with user info
        document.getElementById('username').textContent = currentUser.username;
        document.getElementById('userId').textContent = currentUser.uid;

        // Show user section and hide login section
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('userSection').style.display = 'block';
        document.getElementById('paymentSection').classList.add('active');

        showStatus(`مرحباً ${currentUser.username}! تم تسجيل الدخول بنجاح.`, 'success');

        console.log('User authenticated:', currentUser);
    } catch (error) {
        console.error('Authentication error:', error);
        showStatus('فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.', 'error');
    }
}

// Create a payment
async function createPayment() {
    const amount = parseFloat(document.getElementById('amount').value);
    const memo = document.getElementById('memo').value;

    if (!amount || amount <= 0) {
        showStatus('يرجى إدخال مبلغ صحيح', 'error');
        return;
    }

    if (!memo) {
        showStatus('يرجى إدخال وصف للمعاملة', 'error');
        return;
    }

    try {
        showStatus('جاري معالجة الدفعة...', 'info');

        const paymentData = {
            amount: amount,
            memo: memo,
            metadata: {
                app: 'PiMetaConnect',
                timestamp: new Date().toISOString()
            }
        };

        const paymentCallbacks = {
            onReadyForServerApproval: function(paymentId) {
                console.log('Payment ready for approval:', paymentId);
                showStatus('الدفعة جاهزة للموافقة...', 'info');
                // Here you would typically call your backend to approve the payment
                approvePayment(paymentId);
            },
            onReadyForServerCompletion: function(paymentId, txid) {
                console.log('Payment ready for completion:', paymentId, txid);
                showStatus('جاري إتمام الدفعة...', 'info');
                // Here you would typically call your backend to complete the payment
                completePayment(paymentId, txid);
            },
            onCancel: function(paymentId) {
                console.log('Payment cancelled:', paymentId);
                showStatus('تم إلغاء الدفعة', 'error');
            },
            onError: function(error, payment) {
                console.error('Payment error:', error, payment);
                showStatus('خطأ في معالجة الدفعة: ' + error.message, 'error');
            }
        };

        const payment = await Pi.createPayment(paymentData, paymentCallbacks);
        console.log('Payment created:', payment);
    } catch (error) {
        console.error('Payment creation error:', error);
        showStatus('فشل إنشاء الدفعة. يرجى المحاولة مرة أخرى.', 'error');
    }
}

// Handle incomplete payment found during authentication
function onIncompletePaymentFound(payment) {
    console.log('Incomplete payment found:', payment);
    showStatus('تم العثور على دفعة غير مكتملة. جاري المعالجة...', 'info');

    // Return the payment to be handled
    return payment;
}

// Approve payment on server (mock function - replace with actual backend call)
async function approvePayment(paymentId) {
    try {
        // This should be replaced with actual backend API call
        console.log('Approving payment:', paymentId);

        // Simulate server approval
        setTimeout(() => {
            Pi.approvePayment(paymentId);
            showStatus('تمت الموافقة على الدفعة', 'success');
        }, 1000);
    } catch (error) {
        console.error('Payment approval error:', error);
        showStatus('خطأ في الموافقة على الدفعة', 'error');
    }
}

// Complete payment on server (mock function - replace with actual backend call)
async function completePayment(paymentId, txid) {
    try {
        // This should be replaced with actual backend API call
        console.log('Completing payment:', paymentId, txid);

        // Simulate server completion
        setTimeout(() => {
            Pi.completePayment(paymentId, txid);
            showStatus('تم إتمام الدفعة بنجاح! 🎉', 'success');

            // Clear form
            document.getElementById('amount').value = '';
            document.getElementById('memo').value = '';
        }, 1000);
    } catch (error) {
        console.error('Payment completion error:', error);
        showStatus('خطأ في إتمام الدفعة', 'error');
    }
}

// Logout function
function logout() {
    currentUser = null;
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('userSection').style.display = 'none';
    document.getElementById('paymentSection').classList.remove('active');
    showStatus('تم تسجيل الخروج بنجاح', 'info');
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;

    // Auto-hide after 5 seconds for success/error messages
    if (type === 'success' || type === 'error') {
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'status';
        }, 5000);
    }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        authenticateUser,
        createPayment,
        logout
    };
}
