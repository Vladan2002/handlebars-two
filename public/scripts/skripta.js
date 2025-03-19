

function toggleMenu() {
    var menu = document.getElementById("select-menu");
    menu.classList.toggle("navbar__small__select--active");
}

document.addEventListener("DOMContentLoaded", function () {
    if (window.location.href.indexOf("localhost:3002/product") === -1) {
        return;
    }
    var sliderContainer = document.getElementById("slider-container");
    var slideImages = document.querySelectorAll(".slider__img");
    var prevButton = document.getElementById("prev-slide");
    var nextButton = document.getElementById("next-slide");
    var thumbnails = document.querySelectorAll(".slider__thumbnail");

    var currentIndex = 0;
    var totalSlides = slideImages.length;

    function updateSlider() {
        var offset = -currentIndex * 100;
        sliderContainer.style.transform = "translateX(" + offset + "%)";

        var allThumbnails = document.querySelectorAll(".slider__thumbnail");
        for (var i = 0; i < allThumbnails.length; i++) {
            allThumbnails[i].classList.toggle("slider__thumbnail--active", i === currentIndex);
        }
    }

    for (var i = 0; i < thumbnails.length; i++) {
        (function (i) {
            thumbnails[i].addEventListener("click", function () {
                currentIndex = parseInt(thumbnails[i].dataset.index, 10);
                updateSlider();
            });
        })(i);
    }

    nextButton.addEventListener("click", function () {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSlider();
    });

    prevButton.addEventListener("click", function () {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSlider();
    });

    updateSlider();
});

function categories() {
    var buttons = document.querySelectorAll("#menu button");
    var control = 0;
    if (buttons[1].classList.contains("container__side__menu__button--deactivate-button")) {
        control = 1;
    }

    for (var i = 1; i < buttons.length; i++) {
        if (control === 1) {
            if (buttons[i].hasAttribute("data-category")) { continue; }
            buttons[i].classList.remove("container__side__menu__button--deactivate-button");
        } else {
            buttons[i].classList.add("container__side__menu__button--deactivate-button");
        }
    }
}

function navbar(element) {
    var a = document.querySelectorAll("#select-menu a");
    for (var i = 0; i < a.length; i++) {
        if (a[i].classList.contains("navbar__small__select__button--active")) {
            a[i].classList.remove("navbar__small__select__button--active");
        }
    }
    element.classList.add("navbar__small__select__button--active");
}

function toggleSubcategories(category) {
    var subcategories = document.querySelectorAll('.container__side__menu__button--subcategory[data-category="' + category + '"]');

    for (var i = 0; i < subcategories.length; i++) {
        subcategories[i].classList.toggle('container__side__menu__button--deactivate-button');
    }
}

function increaseQuantity() {
    var input = document.getElementById("quantity");
    var value = parseInt(input.value, 10);
    value = isNaN(value) ? 1 : value + 1;
    input.value = value.toString().padStart(2, '0');
}

function decreaseQuantity() {
    var input = document.getElementById("quantity");
    var value = parseInt(input.value, 10);
    if (value > 1) {
        value--;
    }
    input.value = value.toString().padStart(2, '0');
}

function openTab(event, tabName) {
    var tabContent = document.getElementsByClassName("main__table__content");
    for (var i = 0; i < tabContent.length; i++) {
        tabContent[i].classList.remove("main__table--active");
    }

    var tabButtons = document.getElementsByClassName("main__table__tabs__button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("main__table__tabs--active");
    }

    document.getElementById(tabName).classList.add("main__table--active");
    event.currentTarget.classList.add("main__table__tabs--active");
}

function rateStar(rating) {
    var stars = document.querySelectorAll(".fa-star");
    for (var i = 0; i < stars.length; i++) {
        if (i < rating) {
            stars[i].classList.add("main__table__checked");
        } else {
            stars[i].classList.remove("main__table__checked");
        }
    }
    document.getElementById("rating-value").textContent = rating;
}

var images = document.querySelectorAll(".container__products__slider__show img");
var number = images.length;
var slide = 1;
var progress=100/number;
var bar=document.getElementById("progress");


function slider(prev=false) {
    if (prev) {
        if (slide === number) {
            images[0].classList.remove("container__products__slider__show__img--active");
        } else {
            images[slide].classList.remove("container__products__slider__show__img--active");
        }
    } else {
        if (slide > 1) {
            images[slide - 2].classList.remove("container__products__slider__show__img--active");
        } else {
            images[number - 1].classList.remove("container__products__slider__show__img--active");
        }
    }
    images[slide-1].classList.add("container__products__slider__show__img--active");
    bar.style.width = slide*progress + "%";

}
function plusSlide() {
    slide = (slide % number) + 1;
    slider();
}


function minusSlide() {
    if (slide > 1) {
        slide--;
    } else {
        slide = number;
    }
    slider(true);
}
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const accordionResponse = await axios.get("/partials/accordion.hbs");
        Handlebars.registerPartial("accordion", accordionResponse.data);

        const categoriesResponse = await axios.get("http://localhost:5000/categories");
        const categories = categoriesResponse.data;
        console.log(categories);

        for (let i = 0; i < categories.length; i++) {
            const subcategoriesResponse = await axios.get(`http://localhost:5000/subcategories?category_id=${categories[i].id}`);
            const subcategories = subcategoriesResponse.data;
            categories[i].subcategories = subcategories;
        }

        const menuTemplateSource = document.getElementById("menu-template").innerHTML;
        const menuTemplate = Handlebars.compile(menuTemplateSource);

        const menuHtml = menuTemplate({ categories });

        const menuContainer = document.getElementById("menu");
        menuContainer.innerHTML = menuHtml;

    } catch (error) {
        console.error("Greška prilikom učitavanja podataka:", error);
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const loader = document.getElementById("loader");
    loader.style.display = "block";

    axios.get('/partials/card.hbs')
        .then(response => {
            Handlebars.registerPartial('card', response.data);

            axios.all([
                axios.get("http://localhost:5000/products"),
                axios.get("http://localhost:5000/images")
            ])
                .then(axios.spread((productRes, imageRes) => {
                    let products = productRes.data;
                    let images = imageRes.data;
                    console.log(images);
                    console.log(products);

                    products.forEach(product => {
                        let productImages = images.filter(img => img.product_id === product.id);
                        product.image = productImages.length > 0 ? productImages[0].source :
                            "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";

                        product.newPrice = product.discount > 0
                            ? product.price - (product.price * product.discount / 100)
                            : product.price;
                    });

                    setTimeout(() => {
                        let templateSource = document.getElementById("product-template").innerHTML;
                        let template = Handlebars.compile(templateSource);
                        let productList = document.getElementsByClassName("container__products__bar");
                        Array.from(productList).forEach(product => {
                            product.innerHTML = template({ products });
                        });

                        loader.style.display = "none";
                    }, 1000);

                }))
                .catch(error => {
                    console.error("Greška prilikom učitavanja podataka:", error);
                    loader.style.display = "none";
                });

        })
        .catch(error => {
            console.error('Greška prilikom učitavanja partial-a:', error);
            loader.style.display = "none";
        });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
