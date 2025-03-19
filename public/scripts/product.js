document.addEventListener("DOMContentLoaded", function () {
    var loader = document.getElementById("loader");
    var productContent = document.getElementById("product-content");
    loader.style.display = "block";

    var urlParams = new URLSearchParams(window.location.search);
    var id = urlParams.get("id");

    if (!id) {
        productContent.innerHTML = "<p>Nije pronađen ID proizvoda.</p>";
        loader.style.display = "none";
        return;
    }

    Promise.all([
        axios.get('/views/partials/productSlider.hbs'),
        axios.get('/views/partials/productHeader.hbs'),
        axios.get('/views/partials/productInfo.hbs'),
        axios.get('/views/partials/productActions.hbs'),
        axios.get('/views/partials/productTabs.hbs'),
        axios.get('/views/partials/card.hbs')
    ]).then(function (responses) {
        Handlebars.registerPartial('productSlider', responses[0].data);
        Handlebars.registerPartial('productHeader', responses[1].data);
        Handlebars.registerPartial('productInfo', responses[2].data);
        Handlebars.registerPartial('productActions', responses[3].data);
        Handlebars.registerPartial('productTabs', responses[4].data);
        Handlebars.registerPartial('card', responses[5].data);

        return Promise.all([
            axios.get("http://localhost:5000/products?id=" + id),
            axios.get("http://localhost:5000/images?product_id=" + id),
            axios.get("http://localhost:5000/description?product_id=" + id)
        ]);
    }).then(function (responses) {
        var productResponse = responses[0].data;
        var imagesResponse = responses[1].data;
        var descriptionResponse = responses[2].data;

        var selectedProduct = productResponse[0];
        var description = descriptionResponse[0];
        var product = {};

        product.productId = selectedProduct.id;
        product.productName = selectedProduct.name;

        if (selectedProduct.discount > 0) {
            product.newPrice = (selectedProduct.price - (selectedProduct.price * selectedProduct.discount / 100)).toFixed(2);
        } else {
            product.newPrice = selectedProduct.price;
        }

        if (description) {
            product.productSKU = description.SKU;
            if (description.product_description) {
                product.productDesc = description.product_description.split(" | ");
            } else {
                product.productDesc = ["Nema opisa"];
            }
        } else {
            product.productSKU = "N/A";
            product.productDesc = ["Nema opisa"];
        }

        if (description && description.product_specs) {
            var specsArray = description.product_specs.split(" | ");
            var midIndex = Math.ceil(specsArray.length / 2);
            product.productSpecsLeft = specsArray.slice(0, midIndex);
            product.productSpecsRight = specsArray.slice(midIndex);
        } else {
            product.productSpecsLeft = ["Nema opisa"];
            product.productSpecsRight = [""];
        }

        if (imagesResponse.length > 0) {
            product.productImages = imagesResponse.map(function (image) {
                return { source: image.source };
            });
        } else {
            product.productImages = [{ source: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png" }];
        }

        return Promise.all([
            axios.get("http://localhost:5000/products?subcategory_id=" + selectedProduct.subcategory_id),
            axios.get("http://localhost:5000/images")
        ]).then(function (responses) {
            var relatedProducts = responses[0].data;
            var images = responses[1].data;
            var temp = -1;

            for (var i = 0; i < relatedProducts.length; i++) {
                if (relatedProducts[i].id == id) {
                    temp = i;
                }

                if (relatedProducts[i].discount > 0) {
                    relatedProducts[i].newPrice = relatedProducts[i].price - relatedProducts[i].price * relatedProducts[i].discount / 100;
                } else {
                    relatedProducts[i].newPrice = relatedProducts[i].price;
                }

                var productImages = images.filter(function (img) {
                    return img.product_id === Number(relatedProducts[i].id);
                });

                if (productImages.length > 0) {
                    relatedProducts[i].image = productImages[0].source;
                } else {
                    relatedProducts[i].image = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
                }
            }

            if (temp !== -1) {
                relatedProducts.splice(temp, 1);
            }
            product.relatedProducts = relatedProducts.slice(0, 4);

            var templateSource = document.getElementById("product-template").innerHTML;
            var template = Handlebars.compile(templateSource);
            productContent.innerHTML = template(product);

            initializeSlider();
            loader.style.display = "none";
        });
    }).catch(function (error) {
        console.error("Greška:", error);
        productContent.innerHTML = "<p>Greška pri učitavanju proizvoda.</p>";
        loader.style.display = "none";
    });
});

function initializeSlider() {
    var sliderContainer = document.getElementById("slider-container");
    var slides = sliderContainer.getElementsByClassName("slider__img");
    var thumbnails = document.getElementsByClassName("slider__thumbnail");
    var prevButton = document.getElementById("prev-slide");
    var nextButton = document.getElementById("next-slide");
    var currentIndex = 0;

    function showSlide(index) {
        if (index >= slides.length) index = 0;
        if (index < 0) index = slides.length - 1;

        for (var i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
            thumbnails[i].classList.remove("slider__thumbnail--active");
        }
        slides[index].style.display = "block";
        thumbnails[index].classList.add("slider__thumbnail--active");
        currentIndex = index;
    }

    showSlide(0);

    prevButton.addEventListener("click", function () { showSlide(currentIndex - 1); });
    nextButton.addEventListener("click", function () { showSlide(currentIndex + 1); });

    for (var i = 0; i < thumbnails.length; i++) {
        thumbnails[i].addEventListener("click", function () {
            var index = parseInt(this.getAttribute("data-index"));
            showSlide(index);
        });
    }
}

function increaseQuantity() {
    var quantity = document.getElementById("quantity");
    quantity.value = parseInt(quantity.value) + 1;
}

function decreaseQuantity() {
    var quantity = document.getElementById("quantity");
    if (parseInt(quantity.value) > 1) {
        quantity.value = parseInt(quantity.value) - 1;
    }
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("main__table__content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("main__table__tabs__button");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" main__table--active", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " main__table--active";
}

function rateStar(rating) {
    document.getElementById("rating-value").innerText = rating;
    var stars = document.getElementsByClassName("fa-star");
    for (var i = 0; i < stars.length; i++) {
        stars[i].classList.toggle("checked", i < rating);
    }
}
