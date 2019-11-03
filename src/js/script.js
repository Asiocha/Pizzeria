/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);
    }

    renderInMenu() {
      const thisProduct = this;
      /*generate HTML based on template*/
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /*create element using utils.createElementFromHTML*/
      thisProduct.element = utils.createDOMFromHTML(generatedHTML); //we właściwość instancji zapisać wygenerowany element
      /*find menu container*/
      const menuContainer = document.querySelector(select.containerOf.menu);
      /*add element to menu*/
      menuContainer.appendChild(thisProduct.element); //dodajemy stworzony element do menu
    }
    getElements() {
      const thisProduct = this;
      //console.log(thisProduct);

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion() {
      const thisProduct = this;
      /* find the clickable trigger (the element that should react to clicking) */
      const productHeader = thisProduct.element.querySelector(select.menuProduct.clickable);
      /* START: click event listener to trigger */
      productHeader.addEventListener('click', function() {
        //console.log('clicked');
        /* prevent default action for event */
        event.preventDefault();
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
        //console.log(thisProduct);
        /* find all active products */
        const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
        //console.log(activeProducts);
        /* START LOOP: for each active product */
        for (let active of activeProducts) {
          /* START: if the active product isn't the element of thisProduct */
          if (active !== thisProduct.element) {
            /* remove class active for the active product */
            thisProduct.element.classList.remove(classNames.menuProduct.wrapperActive);
            /* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }

    initOrderForm() {
      const thisProduct = this;
      //console.log('initOrderForm', thisProduct);

      thisProduct.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener('change', function() {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {

      const thisProduct = this;
      //console.log('processOrder', thisProduct);
      /* read all data from the form (using utils.serializeFormToObject) and save it to const formData */
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);
      /* set variable price to equal thisProduct.data.price */
      thisProduct.params = {};
      let price = thisProduct.data.price;
      /* START LOOP: for each paramId in thisProduct.data.params */
      for (let paramId in thisProduct.data.params) {
        /* save the element in thisProduct.data.params with key paramId as const param */
        const param = thisProduct.data.params[paramId];
        /* START LOOP: for each optionId in param.options */
        for (let optionId in param.options) {
          /* save the element in param.options with key optionId as const option */
          const option = param.options[optionId];

          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;

          /* START IF: if option is selected and option is not default */
          if (optionSelected && !option.default) {
            /* add price of option to variable price */
            price = price + option.price;
            /* END IF: if option is selected and option is not default */
          } else if (!optionSelected && option.delault) {
            /* START ELSE IF: if option is not selected and option is default */
            price = price - option.price;
            /* deduct price of option from price */
          }
          /* END ELSE IF: if option is not selected and option is default */

          const images = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);

          for (let image of images) {

            if (optionSelected) {
              if (!thisProduct.params[paramId]) {
                thisProduct.params[paramId] = {
                  label: param.label,
                  options: {},
                };
              }
              thisProduct.params[paramId].options[optionId] = option.label;

              image.classList.add(classNames.menuProduct.imageVisible);

            } else if (!optionSelected) {

              image.classList.remove(classNames.menuProduct.imageVisible);
            }
          }
        }
        /* END LOOP: for each optionId in param.options */
      }
      /* END LOOP: for each paramId in thisProduct.data.params */
      /* multiply price by amout */
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

      thisProduct.priceElem.innerHTML = thisProduct.price;
      /* set the contents of thisProduct.priceElem to be the value of variable price */
      //console.log('Show product params', thisProduct.params);
    }
    initAmountWidget() {
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }
    addToCart() {
      const thisProduct = this;
      thisProduct.name = thisProduct.data.name;
      thisProduct.id = thisProduct.data.id;
      thisProduct.amount = thisProduct.amountWidget.value;

      app.cart.add(thisProduct);
    }
  }
  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.value = settings.amountWidget.defaultValue;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);

      //console.log('AmountWidget', thisWidget);
      //console.log('constructor arguments:', element);
    }

    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    }

    setValue(value) {
      const thisWidget = this;

      const newValue = parseInt(value);

      /* TODO: Add validation */
      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;

      thisWidget.input.value = thisWidget.value;

      if (newValue >= minValue && newValue <= maxValue) {
        thisWidget.value = newValue;
        thisWidget.announce();
      }
    }
    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.Value);
      });
      thisWidget.linkDecrease.addEventListener('click', function() {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
      thisWidget.linkIncrease.addEventListener('click', function() {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }
  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
      thisCart.deliveryFee =settings.cart.defaultDeliveryFee;

      //console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }
    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      const productList = thisCart.dom.productList;

      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

      console.log('adding product', menuProduct);

      thisCart.update();
    }
    update() {
      const thisCart = this;

      thisCart.totalNumber = 0;
      thsiCart.subtotalPrice = 0;

      for(let thisCartProduct of thisCartProducts){
        thisCart.subtotalPrice + thisProduct.price;
        thisCart.totalNumber + thisProduct.amount;
      }
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }
  }
  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;

      thisCartProduct.id = menuProduct.id;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.getElements(element);
      thisCartProduct.initAmountWidget();

      thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

      //console.log('show product', thisCartProduct);
    }
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {};

      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    }
    initAmountWidget() {
      const thisCartProduct = this;
      thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
      thisCartProduct.dom.amountWidget.addEventListener('updated', function() {
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.PriceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }
  }
  const app = {
    initMenu: function() {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function() {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    initCart: function() {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function() {
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}
