var urlParams = new URLSearchParams(window.location.search);
var id = urlParams.get("id");

if (!id) {
alert()
window.location.href = 'http://localhost:8080/views/index.html';
}
async function slider() {
    try {
        var productContent = document.getElementById("slider");


        productContent.innerHTML = `
            
                <div class="slider__container skeleton-loader">
                    <div class="skeleton skeleton__img"></div>
                </div>
                <div class="slider__pager">
                    <button class="main__left__product__slider__controls" id="prev-slide">❮</button>
                    <div class="main__left__product__slider__pager">
                        <div id="bx-pager" class="pagerrrr">
                            <div class="skeleton skeleton__thumbnail"></div>
                            <div class="skeleton skeleton__thumbnail"></div>
                            <div class="skeleton skeleton__thumbnail"></div>
                            <div class="skeleton skeleton__thumbnail"></div>
                            <div class="skeleton skeleton__thumbnail"></div>
                            <div class="skeleton skeleton__thumbnail"></div>
                        </div>
                    </div>
                    <button class="main__left__product__slider__controls" id="next-slide">❯</button>
                </div>
            
        `;

        await new Promise(resolve => setTimeout(resolve, 1000));

        const imagesResponse = await axios.get(`http://localhost:5000/images?product_id=` + id);
        const productImages = imagesResponse.data.length > 0 ? imagesResponse.data : [
            { source: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png" }
        ];
        const partialResponse = await axios.get('/views/partials/productSlider.hbs');
        Handlebars.registerPartial('productSlider', partialResponse.data);
        const templateElement = document.getElementById("slider-template");
        if (!templateElement) {
            console.error("Greška: slider-template nije pronađen!");
            return;
        }
        const templateSource = templateElement.innerHTML;
        const template = Handlebars.compile(templateSource);
        const generatedHtml = template({ productImages });

        productContent.innerHTML = generatedHtml;

        initializeSlider()


    } catch (error) {
        console.error("Greška prilikom učitavanja podataka:", error);
    }
}

slider();

async function description() {
    await new Promise(resolve => setTimeout(resolve, 1000));

    var content = document.getElementById("description");


    Promise.all([
        axios.get('/views/partials/productHeader.hbs'),
        axios.get('/views/partials/productInfo.hbs'),
        axios.get("http://localhost:5000/products?id=" + id),
        axios.get("http://localhost:5000/description?product_id=" + id)
    ])
        .then((responses) => {
            Handlebars.registerPartial('productHeader', responses[0].data);
            Handlebars.registerPartial('productInfo', responses[1].data);

            var productResponse = responses[2].data[0];
            var descResponse = responses[3].data[0];

            var product = {
                productId: productResponse.id,
                productName: productResponse.name,
                newPrice: productResponse.discount > 0
                    ? (productResponse.price - (productResponse.price * productResponse.discount / 100)).toFixed(2)
                    : productResponse.price,
                productSKU: descResponse ? descResponse.SKU : "N/A",
                productDesc: descResponse && descResponse.product_description
                    ? descResponse.product_description.split(" | ")
                    : ["Nema opisa"]
            };



            var templateSource = document.getElementById("description-template").innerHTML;
            var template = Handlebars.compile(templateSource);
            content.innerHTML = template(product);

        })
        .catch((error) => {
            console.error("Greška:", error);
            content.innerHTML = "<p>Greška pri učitavanju podataka.</p>";
        });
}

description();


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
        stars[i].classList.toggle("main__table__checked", i < rating);
    }


}




function loadTemplate(url, target, data = {}) {
    axios.get(url)
        .then(response => {
            let template = Handlebars.compile(response.data);
            document.getElementById(target).innerHTML = template(data);
        })
        .catch(error => console.error(`Error loading ${url}:`, error));
}

document.addEventListener("DOMContentLoaded", function () {
    loadTemplate("layouts/header.hbs", "header-container");
    loadTemplate("layouts/footer.hbs", "footer-container");
});



async function tabs(){

    var content = document.getElementById("table");

    Promise.all([
        axios.get('/views/partials/productTabs.hbs'),
        axios.get("http://localhost:5000/description?product_id=" + id)
    ]).then(async response => {
        Handlebars.registerPartial('productTabs', response[0].data);
        var templateSource = document.getElementById("table-template").innerHTML;
        var template = Handlebars.compile(templateSource);
        content.innerHTML = template();
        await new Promise(resolve => setTimeout(resolve, 1000));

        var product = {
            productSpecsLeft: ["Nema specifikacija"],
            productSpecsRight: [""],
        };

        var specification = response[1].data[0].product_specs.split(" | ");
        console.log(specification);

        var half = Math.ceil(specification.length / 2);
        console.log(half);

        if (specification.length > 0) {
            product.productSpecsLeft = specification.slice(0, half);
            product.productSpecsRight = specification.splice(half);
        }

        var templateSource = document.getElementById("table-template").innerHTML;
        var template = Handlebars.compile(templateSource);
        content.innerHTML = template(product);


    })

}
tabs()


async function similarProducts() {
    var content = document.getElementById("discounts-bar");








    try {
        const [cardTemplate, productResponse] = await Promise.all([
            axios.get('/views/partials/card.hbs'),
            axios.get("http://localhost:5000/products?id=" + id)
        ]);

        Handlebars.registerPartial('card', cardTemplate.data);
        var subcategory = productResponse.data[0].subcategory_id;
        var templateSource = document.getElementById("discounts-template").innerHTML;
        var temporary={temp:[]}
        axios.get('http://localhost:5000/products?subcategory_id=' + subcategory)
            .then(res=>{

                temp=-1;
                for (let i = 0; i < res.data.length; i++) {
                    let element = res.data[i];

                    if (element.id == id) {
                        temp=i;
                    }

                    console.log(element);
                    temporary.temp.push(element);
                }

                if(temp!=-1){
                    temporary.temp.splice(temporary.temp.indexOf(temp), 1);
                }
                temporary.temp=temporary.temp.slice(0,4)
                var template = Handlebars.compile(templateSource);
                content.innerHTML = template(temporary);
            })





        var response = await axios.get('http://localhost:5000/products?subcategory_id=' + subcategory);
        var similarProducts = response.data;
        await new Promise(resolve => setTimeout(resolve, 1000));
        var temp=-1;
        for (var i = 0; i < similarProducts.length; i++) {
            similarProducts[i].newPrice = similarProducts[i].discount > 0
                ? similarProducts[i].price - (similarProducts[i].price * similarProducts[i].discount / 100)
                : similarProducts[i].price;

            if (similarProducts[i].id==id){
                temp=i;
            }
            try {
                var imageResponse = await axios.get('http://localhost:5000/images?product_id=' + similarProducts[i].id + "&_limit=1");

                similarProducts[i].image = imageResponse.data?.[0]?.source ||
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
            } catch (error) {
                console.error("Greška pri učitavanju slike:", error);
                similarProducts[i].image = "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png";
            }
        }
        similarProducts.splice(similarProducts.indexOf(similarProducts[temp]), 1);
        similarProducts=similarProducts.slice(0,4);
        var productsData = { products: similarProducts };

        var template = Handlebars.compile(templateSource);
        content.innerHTML = template(productsData);

    } catch (error) {
        console.error("Greška pri učitavanju proizvoda:", error);
    }
}

similarProducts();



function rate(event) {
    event.preventDefault();

    var rating = document.getElementById("rating-value").innerText;

    if (rating == 0) {
        alert("Molimo vas da izaberete ocenu pre slanja!");
        return;
    }

    axios.post('http://localhost:5000/ratings', {
        rating: rating,
        product_id: id
    }).then(function (res) {
        console.log("Uspešno poslato:", res.data);
        alert("Hvala na oceni!");
    }).catch(function (err) {
        console.error("Greška pri slanju ocene:", err);
        alert("Došlo je do greške. Pokušajte ponovo.");
    });
}