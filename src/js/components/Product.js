import {select, classNames, templates} from './settings.js';
import utils from './utils.js';
import AmountWidget from './components/AmountWidget.js';

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

    //app.cart.add(thisProduct);

    const event = new CustomEvent ('add-to-cart'){
      bubbles:true,
      detail {
        product: thisProduct;
      }
      thisProduct.element.dom.dispatchEvent(event);
    }
  }
}

export default Product;
