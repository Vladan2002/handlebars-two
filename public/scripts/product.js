var urlParams = new URLSearchParams(window.location.search);
var id = urlParams.get("id");
var cekanje=[1000,2000,3000,4000]
console.log(id);
var database="http://localhost:5000/"

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





if (!id) {
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

        await new Promise(resolve => setTimeout(resolve, cekanje[1]));

        var imagesUrl=`${database}images?product_id=${id}`


        const imagesResponse = await axios.get(imagesUrl);


        const productImages = imagesResponse||imagesResponse.data.length > 0 ? imagesResponse.data : [
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
    await new Promise(resolve => setTimeout(resolve, cekanje[2]));

    const content = document.getElementById("description");

    try {
        const [headerResponse, infoResponse, productResponse, descResponse] = await Promise.all([
            axios.get('/views/partials/productHeader.hbs'),
            axios.get('/views/partials/productInfo.hbs'),
            axios.get(`${database}products?id=${id}`),
            axios.get(`${database}description?product_id=${id}`)
        ]);

        Handlebars.registerPartial('productHeader', headerResponse.data);
        Handlebars.registerPartial('productInfo', infoResponse.data);

        let product = {
            productId: "Nema proizvoda",
            productName: "Proizvod ne postoji",
            newPrice: 0,
            productSKU: "N/A",
            productDesc: ["Nema opisa"]
        };

        const hasProduct = productResponse.data.length > 0;
        const hasDescription = descResponse.data.length > 0;

        if (!hasProduct && !hasDescription) {
            const templateSource = document.getElementById("description-template").innerHTML;
            const template = Handlebars.compile(templateSource);
            content.innerHTML = template(product);
            return;
        }

        if (hasProduct) {
            const productData = productResponse.data[0];
            product.productId = productData.id;
            product.productName = productData.name;
            product.newPrice = productData.discount > 0
                ? (productData.price - (productData.price * productData.discount / 100)).toFixed(2)
                : productData.price;
        }

        if (hasDescription) {
            const descData = descResponse.data[0];
            product.productSKU = descData.SKU;
            product.productDesc = descData.product_description
                ? descData.product_description.split("|")
                : ["Nema opisa"];
        }

        const templateSource = document.getElementById("description-template").innerHTML;
        const template = Handlebars.compile(templateSource);
        content.innerHTML = template(product);
    } catch (error) {
        console.error("Greška pri učitavanju podataka:", error);
        content.innerHTML = "<p>Greška pri učitavanju podataka.</p>";
    }
}

description();


function previewImages() {
    let previewContainer = document.getElementById("image-preview");
    previewContainer.innerHTML = "";

    let files = document.getElementById("product-images").files;

    if (files.length > 0) {
        Array.from(files).forEach(file => {
            let reader = new FileReader();

            reader.onload = function (e) {
                let img = document.createElement("img");
                img.src = e.target.result;
                img.style.width = "30px";
                img.style.height = "30px";
                img.style.margin = "2px";
                previewContainer.appendChild(img);
            };

            reader.readAsDataURL(file);
        });
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



async function tabs() {
    const content = document.getElementById("table");

    try {
        const [tabsResponse, descResponse] = await Promise.all([
            axios.get('/views/partials/productTabs.hbs'),
            axios.get(`${database}description?product_id=${id}`)
        ]);

        Handlebars.registerPartial('productTabs', tabsResponse.data);

        const templateSource = document.getElementById("table-template").innerHTML;
        const template = Handlebars.compile(templateSource);
        content.innerHTML = template();

        await new Promise(resolve => setTimeout(resolve, cekanje[3]));

        let product = {
            productSpecsLeft: ["Nema specifikacija"],
            productSpecsRight: [""]
        };

        if (descResponse.data.length > 0 && descResponse.data[0].product_specs) {
            const specification = descResponse.data[0].product_specs.split("|");

            if (specification.length > 0) {
                const half = Math.ceil(specification.length / 2);
                product.productSpecsLeft = specification.slice(0, half);
                product.productSpecsRight = specification.slice(half);
            }
        }

        content.innerHTML = template(product);
    } catch (error) {
        console.error("Greška pri učitavanju tabova:", error);
        content.innerHTML = "<p>Greška pri učitavanju podataka.</p>";
    }
}
tabs()


async function similarProducts() {
    var content = document.getElementById("discounts-bar");
    content.style.justifyContent = "flex-start";

    try {
        const [cardTemplate, productResponse] = await Promise.all([
            axios.get('/views/partials/card.hbs'),
            axios.get(`${database}products?id=` + id)
        ]);

        Handlebars.registerPartial('card', cardTemplate.data);
        if(!productResponse||productResponse.data.length == 0) {

            content.innerHTML = "<div class=\"no-products\">\n" +
                "    <h2>Nema sličnih proizvoda</h2>\n" +
                "    <p>Trenutno nemamo slične proizvode za prikaz. Pokušajte kasnije ili provjerite druge kategorije!</p>\n" +
                "</div>";
            return;


        }
        var subcategory = productResponse.data[0].subcategory_id;
        var templateSource = document.getElementById("discounts-template").innerHTML;
        var temporaryArray={temp:[]}
        var similarExist=true;

        await axios.get(`${database}products?subcategory_id=` + subcategory)
            .then(res=>{

                if(res.data.length == 1){
                    similarExist=false;
                    return;
                }
                temp=-1;
                for (let i = 0; i < res.data.length; i++) {
                    let element = res.data[i];

                    if (element.id == id) {
                        temp=i;
                    }

                    console.log(element);
                    temporaryArray.temp.push(element);
                }

                if(temp!=-1){
                    temporaryArray.temp.splice(temporaryArray.temp.indexOf(temp), 1);
                }
                temporaryArray.temp=temporaryArray.temp.slice(0,4)
                var template = Handlebars.compile(templateSource);
                content.innerHTML = template(temporaryArray);
                document.getElementById("discounts-template").style.justifyContent = "flex-start";
            })



        if(similarExist==false){
            content.innerHTML = "<div class=\"no-products\">\n" +
                "    <h2>Nema sličnih proizvoda</h2>\n" +
                "    <p>Trenutno nemamo slične proizvode za prikaz. Pokušajte kasnije ili provjerite druge kategorije!</p>\n" +
                "</div>";
            return;
        }


        var response = await axios.get(`${database}products?subcategory_id=` + subcategory);
        var similarProducts = response.data;
        await new Promise(resolve => setTimeout(resolve, cekanje[0]));
        var temp=-1;
        for (var i = 0; i < similarProducts.length; i++) {
            similarProducts[i].newPrice = similarProducts[i].discount > 0
                ? similarProducts[i].price - (similarProducts[i].price * similarProducts[i].discount / 100)
                : similarProducts[i].price;

            if (similarProducts[i].id==id){
                temp=i;
            }
            try {
                var imageResponse = await axios.get(`${database}images?product_id=` + similarProducts[i].id + "&_limit=1");

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
        alert("Molimo vas da izaberete ocjenu pre slanja!");
        return;
    }

    axios.post(`${database}ratings`, {
        rating: rating,
        product_id: id
    }).then(function (res) {
        console.log("Uspešno poslato:", res.data);
        alert("Poslato!");
    }).catch(function (err) {
        console.error("Greška pri slanju ocjene:", err);
        alert("Došlo je do greške. Pokušajte ponovo.");
    });
}



function sideBar() {
    var content = document.getElementById("right-sidebar");
    axios.get('/views/partials/videos.hbs').then(function (res) {
        Handlebars.registerPartial('videos', res.data);

        var templateSource = document.getElementById("videos").innerHTML;
        var template=Handlebars.compile(templateSource);
        content.innerHTML = template();


    })
}
sideBar();

function subcategories(){
    var select=document.getElementById('product-subcategory');
    axios.get(`${database}subcategories`).then(function (res) {
        console.log(res.data);
        res.data.forEach(function (item) {
            var option = document.createElement("option");
            option.value = item.id;
            option.text = item.name;
            console.log(item.name);
            select.appendChild(option);

        })
    })
}
subcategories();
async function add() {
    const sku = document.getElementById("SKU")?.value;
    if (!sku) {
        console.error("SKU nije unijet.");
        return;
    }

    const name = document.getElementById("product-name")?.value || "";
    if (!name.trim()) {
        console.error("Naziv proizvoda nije unijet.");
        return;
    }

    const priceInput = document.getElementById("product-price")?.value;
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
        console.error("Cijena mora biti validan broj veći od 0.");
        return;
    }

    const discountInput = document.getElementById("product-discount")?.value;
    const discount = parseFloat(discountInput) || 0;
    if (isNaN(discount) || discount < 0 || discount > 100) {
        console.error("Popust mora biti broj između 0 i 100.");
        return;
    }

    const subcategoryInput = document.getElementById("product-subcategory")?.value;
    const subcategory_id = parseInt(subcategoryInput);
    if (isNaN(subcategory_id) || subcategory_id <= 0) {
        console.error("Podkategorija mora biti validan broj veći od 0.");
        return;
    }

    const images = await convertImagesToBase64();


    const response = await axios.get(`${database}description?SKU=${sku}`);
    if (!response || !response.data) {
        console.error("Greška pri dohvatanju opisa za SKU:", sku);
        return;
    }

    if (response.data.length > 0) {
        console.warn("Proizvod sa SKU:", sku, "već postoji.");
        return;
    }

    const predesc = document.getElementById("product-description")?.value || "";
    const desc = predesc.replace(/,/g, ' | ');

    const preSpecs = document.getElementById("product-specs")?.value || "";
    const specs = preSpecs.replace(/,/g, ' | ');

    alert("Poslato!");

    try {
        const productResponse = await axios.post(`${database}products`, {
            name: name,
            price: price,
            discount: discount,
            subcategory_id: subcategory_id
        });

        console.log("Status:", productResponse.status);
        console.log("Response body:", productResponse.data);
        console.log("Product ID:", productResponse.data.id);

        await axios.post(`${database}description`, {
            product_id: productResponse.data.id,
            SKU: sku,
            product_description: desc,
            product_specs: specs
        });

        if (images.length > 0) {
            const imagePromises = images.map(image => {
                return axios.post(`${database}images`, {
                    product_id: productResponse.data.id,
                    source: image
                });
            });
            await Promise.all(imagePromises);
        }

        alert("Poslato!");
    } catch (err) {
        console.error("Greška pri dodavanju proizvoda:", err);
    }
}
async function convertImagesToBase64() {
    const files = document.getElementById("product-images").files;
    let base64Array = [];

    if (files.length === 0) {
        console.log("Nijedna slika nije izabrana!");
        return base64Array;
    }

    const promises = [];

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        const promise = new Promise((resolve, reject) => {
            reader.onload = function (e) {
                base64Array.push(e.target.result);
                resolve(e.target.result);
            };
            reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        promises.push(promise);
    });

    try {
        await Promise.all(promises);
        return base64Array;
    } catch (error) {
        console.error("Greška prilikom konverzije:", error);
        return [];
    }
}



function showPopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "flex";
}

document.addEventListener("DOMContentLoaded", () => {
    var typedString = "";

    document.addEventListener("keypress", (event) => {
        var char = event.key.toLowerCase();

        typedString += char;

        if (typedString.length > 10) {
            typedString = typedString.slice(-10);
        }

        if (typedString.endsWith("vladan")) {
            var vladanEvent = new CustomEvent("vladanTyped");
            document.dispatchEvent(vladanEvent);
            typedString = "";
        }
    });

    document.addEventListener("vladanTyped", () => {
        showPopup();
    });
});



function closePopup() {
    var popup = document.getElementById("popup");
    popup.style.display = "none";

}


function kartica(id) {
    window.location.assign( `http://localhost:8080/views/product-id.html?id=${id}`);
}