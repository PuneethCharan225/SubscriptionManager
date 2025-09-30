document.addEventListener('DOMContentLoaded', () => {
    const addSubscriptionForm = document.getElementById('add-subscription-form');
    const subscriptionsList = document.getElementById('subscriptions-list');
    const totalSubscriptionsEl = document.getElementById('total-subscriptions');
    const totalMonthlyCostEl = document.getElementById('total-monthly-cost');
    const totalYearlyCostEl = document.getElementById('total-yearly-cost');
    const serviceSelect = document.getElementById('service-select');
    const otherServiceContainer = document.getElementById('other-service-container');
    const otherServiceNameInput = document.getElementById('other-service-name');

    const editModal = document.getElementById('edit-modal');
    const editSubscriptionForm = document.getElementById('edit-subscription-form');
    const cancelEditBtn = document.getElementById('cancel-edit');
    const editServiceSelect = document.getElementById('edit-service-select');
    const editOtherServiceContainer = document.getElementById('edit-other-service-container');
    const editOtherServiceNameInput = document.getElementById('edit-other-service-name');

    const serviceLogos = {
        'Netflix': 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        'Amazon Prime Video': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Amazon_Prime_Video_logo.svg',
        'Disney+ Hotstar': 'https://upload.wikimedia.org/wikipedia/commons/1/13/Disney%2B_Hotstar_logo.svg',
        'SonyLIV': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/SonyLIV_logo.svg/1200px-SonyLIV_logo.svg.png',
        'ZEE5': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/ZEE5_logo.svg/1200px-ZEE5_logo.svg.png',
        'JioCinema': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/JioCinema_Logo.svg/1280px-JioCinema_Logo.svg.png',
        'MX Player': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/MX_Player_Logo.svg/1280px-MX_Player_Logo.svg.png',
        'Voot': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Voot_Select_logo.svg/1280px-Voot_Select_logo.svg.png',
        'ALTBalaji': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Altbalaji_logo_new.svg/2560px-Altbalaji_logo_new.svg.png',
        'Eros Now': 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d Eros_Now_logo.svg/1200px-Eros_Now_logo.svg.png',
        'Sun NXT': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/Sun_NXT_Logo.svg/1200px-Sun_NXT_Logo.svg.png',
        'Planet Marathi': 'https://images.livemint.com/img/2021/08/30/1600x900/Planet_Marathi_1630328203351_1630328209869.png',
        'Saina Play': 'https://play-lh.googleusercontent.com/1-h8oDknzV7yn2V5U322p-Gn1NJVbYvX5-Q9O-Tf-2f7K62if-5f32D-I6-U-bK4eSE',
        'YouTube Premium': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/2560px-YouTube_Premium_logo.svg.png'
    };

    // Load subscriptions from local storage
    let subscriptions = JSON.parse(localStorage.getItem('subscriptions')) || [];

    // Function to save subscriptions to local storage
    const saveSubscriptions = () => {
        localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
    };
    
    // Function to calculate days until next billing date
    const daysUntil = (dateString) => {
        const today = new Date();
        const nextBillingDate = new Date(dateString);
        today.setHours(0, 0, 0, 0);
        nextBillingDate.setHours(0,0,0,0);
        const diffTime = nextBillingDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Function to render subscriptions
    const renderSubscriptions = () => {
        subscriptionsList.innerHTML = '';
        let totalMonthlyCost = 0;
        let totalYearlyCost = 0;

        if (subscriptions.length === 0) {
            subscriptionsList.innerHTML = `<div class="text-center text-gray-500 py-8 bg-gray-800 rounded-lg">
                <p>No subscriptions yet. Add one above to get started!</p>
            </div>`;
        } else {
             // Sort by days until next billing
            const sortedSubscriptions = [...subscriptions].sort((a, b) => {
                return daysUntil(a.nextBillingDate) - daysUntil(b.nextBillingDate);
            });

            sortedSubscriptions.forEach((sub, index) => {
                let monthlyCost = 0;
                switch(sub.billingCycle) {
                    case 'monthly':
                        monthlyCost = sub.price;
                        break;
                    case 'yearly':
                        monthlyCost = sub.price / 12;
                        break;
                    case 'quarterly':
                        monthlyCost = sub.price / 3;
                        break;
                    case 'weekly':
                        monthlyCost = sub.price * 4.33;
                        break;
                }
                totalMonthlyCost += monthlyCost;

                const daysLeft = daysUntil(sub.nextBillingDate);
                let daysText = '';
                let daysColor = 'text-green-400';
                if (daysLeft < 0) {
                    daysText = `Billed ${Math.abs(daysLeft)} days ago`;
                    daysColor = 'text-yellow-400';
                } else if (daysLeft === 0) {
                    daysText = 'Billed today';
                    daysColor = 'text-red-500';
                } else if (daysLeft === 1) {
                    daysText = 'Billed tomorrow';
                    daysColor = 'text-red-400';
                } else {
                    daysText = ` Billed in ${daysLeft} days`;
                    if (daysLeft < 7) daysColor = 'text-yellow-500';
                }
                const originalIndex = subscriptions.findIndex(s => s.id === sub.id);

                const subscriptionEl = document.createElement('div');
                subscriptionEl.className = 'bg-gray-800 p-5 rounded-xl shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between transition hover:shadow-xl hover:scale-[1.02]';
                
                const logoUrl = sub.logoUrl || `https://placehold.co/48x48/4B5563/FFFFFF?text=${sub.name.charAt(0).toUpperCase()}`;
                const logoFallbackUrl = `https://placehold.co/48x48/4B5563/FFFFFF?text=${sub.name.charAt(0).toUpperCase()}`;

                subscriptionEl.innerHTML = `
                    <div class="flex items-center gap-4 mb-4 sm:mb-0">
                        <img src="${logoUrl}" onerror="this.onerror=null;this.src='${logoFallbackUrl}';" alt="${sub.name} logo" class="w-12 h-12 rounded-lg object-contain bg-white p-1">
                        <div>
                            <h3 class="font-bold text-lg text-white">${sub.name}</h3>
                            <p class="text-sm text-gray-400">${sub.category || 'No Category'}</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center w-full sm:w-auto">
                        <div class="sm:text-right">
                            <p class="font-bold text-lg text-white">₹${sub.price.toFixed(2)}</p>
                            <p class="text-sm text-gray-400 capitalize">${sub.billingCycle}</p>
                        </div>
                        <div class="sm:text-right">
                             <p class="font-bold text-lg text-white">${new Date(sub.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                             <p class="text-sm ${daysColor}">${daysText}</p>
                        </div>
                        <div class="col-span-2 sm:col-span-2 flex items-center justify-center sm:justify-end gap-2">
                            <button onclick="openEditModal(${originalIndex})" class="p-2 rounded-md bg-gray-700 hover:bg-gray-600 transition text-gray-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                            </button>
                            <button onclick="deleteSubscription(${originalIndex})" class="p-2 rounded-md bg-red-800 hover:bg-red-700 transition text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                        </div>
                    </div>
                `;
                subscriptionsList.appendChild(subscriptionEl);
            });
        }
        
        totalYearlyCost = totalMonthlyCost * 12;

        totalSubscriptionsEl.textContent = subscriptions.length;
        totalMonthlyCostEl.textContent = `₹${totalMonthlyCost.toFixed(2)}`;
        totalYearlyCostEl.textContent = `₹${totalYearlyCost.toFixed(2)}`;
    };

    // Add new subscription
    addSubscriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        let serviceName = serviceSelect.value;
        if (serviceName === 'Other') {
            serviceName = otherServiceNameInput.value.trim();
            if (!serviceName) {
                alert('Please enter a name for the custom service.');
                return;
            }
        }

        const newSubscription = {
            id: Date.now(), // simple unique id
            name: serviceName,
            price: parseFloat(e.target.price.value),
            billingCycle: e.target['billing-cycle'].value,
            nextBillingDate: e.target['next-billing-date'].value,
            category: e.target.category.value,
            logoUrl: serviceLogos[serviceName] || null
        };
        subscriptions.push(newSubscription);
        saveSubscriptions();
        renderSubscriptions();
        addSubscriptionForm.reset();
        otherServiceContainer.classList.add('hidden');
    });

    // Delete subscription
    window.deleteSubscription = (index) => {
        if (confirm('Are you sure you want to delete this subscription?')) {
            subscriptions.splice(index, 1);
            saveSubscriptions();
            renderSubscriptions();
        }
    };

    // Open Edit Modal
    window.openEditModal = (index) => {
        const sub = subscriptions[index];
        document.getElementById('edit-index').value = index;
        
        // Check if the service is in the predefined list
        if (Object.keys(serviceLogos).includes(sub.name)) {
            editServiceSelect.value = sub.name;
            editOtherServiceContainer.classList.add('hidden');
            editOtherServiceNameInput.value = '';
        } else {
            editServiceSelect.value = 'Other';
            editOtherServiceContainer.classList.remove('hidden');
            editOtherServiceNameInput.value = sub.name;
        }

        document.getElementById('edit-price').value = sub.price;
        document.getElementById('edit-billing-cycle').value = sub.billingCycle;
        document.getElementById('edit-next-billing-date').value = sub.nextBillingDate;
        document.getElementById('edit-category').value = sub.category;
        editModal.style.display = 'flex';
    };

    // Close Edit Modal
    const closeEditModal = () => {
        editModal.style.display = 'none';
    };

    cancelEditBtn.addEventListener('click', closeEditModal);

    // Update subscription
    editSubscriptionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const index = document.getElementById('edit-index').value;
        
        let serviceName = editServiceSelect.value;
        if (serviceName === 'Other') {
            serviceName = editOtherServiceNameInput.value.trim();
            if (!serviceName) {
                alert('Please enter a name for the custom service.');
                return;
            }
        }
        
        subscriptions[index] = {
            ...subscriptions[index], // preserve the id
            name: serviceName,
            price: parseFloat(document.getElementById('edit-price').value),
            billingCycle: document.getElementById('edit-billing-cycle').value,
            nextBillingDate: document.getElementById('edit-next-billing-date').value,
            category: document.getElementById('edit-category').value,
            logoUrl: serviceLogos[serviceName] || null
        };
        saveSubscriptions();
        renderSubscriptions();
        closeEditModal();
    });
    
    // Event listener for the service select dropdowns
    serviceSelect.addEventListener('change', () => {
        if (serviceSelect.value === 'Other') {
            otherServiceContainer.classList.remove('hidden');
        } else {
            otherServiceContainer.classList.add('hidden');
        }
    });
    
    editServiceSelect.addEventListener('change', () => {
        if (editServiceSelect.value === 'Other') {
            editOtherServiceContainer.classList.remove('hidden');
        } else {
            editOtherServiceContainer.classList.add('hidden');
        }
    });

    // Initial render
    renderSubscriptions();
});
