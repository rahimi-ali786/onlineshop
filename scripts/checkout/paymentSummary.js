import {cart, resetCart} from '../../data/cart.js';
import {getProduct} from '../../data/products.js';
import {getDeliveryOption} from '../../data/deliveryOptions.js';
import formatCurrency from '../utils/money.js';
import {addOrder} from '../../data/orders.js';

export function renderPaymentSummary(){
   let productPriceCents = 0;
   let shippingPriceCents = 0;
   cart.forEach((cartItem) => {

      const product = getProduct(cartItem.productId);
      productPriceCents +=  product.priceCents * cartItem.quantity;

      const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
      shippingPriceCents += deliveryOption.priceCents;
     
   });
   const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
   const taxCents = totalBeforeTaxCents * 0.1;
   const totalCents = totalBeforeTaxCents + taxCents;
   
   let cartQuantity = 0;
    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });

   const paymentSummaryHTML = `
      <div class="payment-summary-title">
        Order Summary
      </div>

      <div class="payment-summary-row">
        <div>Items (${cartQuantity}):</div>
        <div class="payment-summary-money">$${formatCurrency(productPriceCents)}</div>
      </div>

      <div class="payment-summary-row">
        <div>Shipping &amp; handling:</div>
        <div class="payment-summary-money">$${formatCurrency(shippingPriceCents)}</div>
      </div>

      <div class="payment-summary-row subtotal-row">
        <div>Total before tax:</div>
        <div class="payment-summary-money">$${formatCurrency(totalBeforeTaxCents)}</div>
      </div>

      <div class="payment-summary-row">
        <div>Estimated tax (10%):</div>
        <div class="payment-summary-money">$${formatCurrency(taxCents)}</div>
      </div>

      <div class="payment-summary-row total-row">
        <div>Order total:</div>
        <div class="payment-summary-money">$${formatCurrency(totalCents)}</div>
      </div>

      <button class="place-order-button button-primary
        js-place-order">
        Place your order
      </button>  
   `;

   document.querySelector('.js-payment-summary')
       .innerHTML = paymentSummaryHTML; 
 
     document.querySelector('.js-place-order')
      .addEventListener('click', () => {
        const order = {
          id: Date.now().toString(),
          products: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            estimatedDeliveryTime: new Date(Date.now() + getDeliveryOption(item.deliveryOptionId).deliveryDays * 24 * 60 * 60 * 1000),
          })),
          orderTime: new Date(),
          totalCostCents: cart.reduce((sum, item) => {
            const product = getProduct(item.productId);
            const delivery = getDeliveryOption(item.deliveryOptionId);
            return sum + (product.priceCents * item.quantity) + delivery.priceCents;
          }, 0)
        };

        addOrder(order);
        resetCart();
        window.location.href = 'orders.html';
      });

}

