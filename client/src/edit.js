import React, { useState, useEffect } from "react";
import './CSS/edit.css';
import img_placeholder from "./icons/picture.svg";
import trash from "./icons/trash.svg"
import edit from "./icons/product.svg"



const Edit = () => {

    const [products, setProducts] = useState([]);
    const [deletedProducts, setDeletedProducts] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const settings = require("./PROJECT_CONFIG.json");

    useEffect(() => {
        fetch("http://"+window.location.hostname+":3001/items")
          .then((res) => res.json())
          .then((json) => setProducts(json))
          .catch((err) => console.log(err));
      }, []);



    const [file, setFile] = useState();

    function handleChange(e) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.addEventListener("load", () => {
           const base64String = reader.result;




            //check size of uploaded file
           var stringLength = base64String.length - 'data:image/png;base64,'.length;
           var sizeInBytes = 4 * Math.ceil((stringLength / 3))*0.5624896334383812;
           var sizeInKb=sizeInBytes/1000;
           if (sizeInKb > settings.image_upload_size*1000){
             console.log("too big");
             setErrorMessage("Das Bild ist zu groß. Die maximale Größe beträgt "+settings.image_upload_size+"MB.");
             return
           }




           setFile(base64String);           
           console.log(file);
        });

        reader.readAsDataURL(file);

        if (file && file.size > settings.image_upload_size * 1024 * 1024) {
            setErrorMessage("Das Bild ist zu groß. Die maximale Größe beträgt "+settings.image_upload_size+"MB.");
            setFile(null);
            console.log(file);

        } else {
            setErrorMessage("");
        }
     }


    const addProduct = (e) => {
            e.preventDefault();

            let item_type = document.getElementById("item_type").value;
            let item_name = document.getElementById("item_name").value;
            let item_size = document.getElementById("item_size").value;
            let item_sum = document.getElementById("item_sum").value;
            let item_stock = document.getElementById("item_stock").value;
            //generate timestamp
            let now = new Date();
            let year = now.getFullYear();
            let month = String(now.getMonth() + 1).padStart(2, "0");
            let day = String(now.getDate()).padStart(2, "0");
            let hours = String(now.getHours()).padStart(2, "0");
            let minutes = String(now.getMinutes()).padStart(2, "0");
            let seconds = String(now.getSeconds()).padStart(2, "0");

            let item_img = `${day}${month}${year}${hours}${minutes}${seconds}.png`;
            let item_url = file;
            console.log(item_img);

            if (!item_name || !item_size || !item_sum || !item_stock || !item_url) {
                setErrorMessage("Please fill in all fields and upload an image.");
                return;
            }

            fetch("http://"+window.location.hostname+":3001/additem", {
                method: "POST",
                headers: {
                "accept": "application/json",
                "content-type": "application/json"
                },
                body: JSON.stringify({
                item_type: item_type,
                item_name: item_name,
                item_size: item_size,
                item_sum: item_sum,
                item_stock: item_stock,
                item_img: item_img,
                item_url: item_url
                })
            })
                .then((res) => res.json())
                .then((json) => {
                console.log(json);
                })
            }

    const deleteProduct = (id) => {
    const product = products.find((p) => p.item_id === id);
        setDeletedProducts([...deletedProducts, product]);
        setProducts(products.filter((p) => p.item_id !== id));
    };

    const editStock = (id) => {
        const product = products.find((p) => p.item_id === id);
        console.log("input"+product.itemid)
        const newStock = parseInt(document.getElementById("input"+id).value);
        if (isNaN(newStock)) {
          setErrorMessage("Please enter a valid stock value.");
          return;
        }
        fetch("http://"+window.location.hostname+":3001/api/changestock", {
          method: "PUT",
          headers: {
            "accept": "application/json",
            "content-type": "application/json"
          },
          body: JSON.stringify({
            item_id: product.item_id,
            item_type: product.item_type,
            item_name: product.item_name,
            item_size: product.item_size,
            item_sum: product.item_sum,
            item_stock: newStock,
            item_img: product.item_img,
            item_url: product.item_url
          })
        })
          .then((res) => res.json())
          .then((json) => {
            console.log(json);
            const updatedProducts = products.map((p) => {
              if (p.item_id === id) {
                return { ...p, item_stock: newStock };
              }
              return p;
            });
            setProducts(updatedProducts);
          })
          .catch((err) => console.log(err));
      };

    const saveChanges = () => {
        deletedProducts.forEach((p) => {
        fetch("http://"+window.location.hostname+":3001/items/${p.item_id}", {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((json) => console.log(json))
            .catch((err) => console.log(err));
        });
        setDeletedProducts([]);
    };

    return (
        <div className='edit'>                

        <h4>Produkt hinzufügen</h4>
            <div className='form_edit'>
                <form>
                <div className="img_upload_wrap">
                <label htmlFor="item_img">
                    {file ? (
                    <img id="img_upload" alt="" src={file} style={{ height: "240px" }} />
                    ) : (
                    <img
                        id="img_placeholder"
                        src={img_placeholder}
                        alt=""
                    />
                    )}
                </label>
                <input id="item_img" type="file" onChange={handleChange} />
                </div>
                    <div className="form_input">
                    <div className='input'>
                        <p>Produktname</p>
                        <input type="text"
                        id="item_name"
                        maxLength={15}
                    />
                </div>
                <div className='input'>
                    <p>Typ</p>
                    <select id="item_type">
                        <option value="1">Getränk</option>
                        <option value="2">Essen</option>
                    </select>
                </div>

                <div className='input'>
                    <p>Größe</p>
                    <input
                        type="text"
                        id="item_size"
                    />
                </div>

                <div className='input'>
                    <p>Produktbeschreibung</p>
                    <input
                        type="text"
                        id="item_sum"
                    />
                </div>

                <div className='input'>
                    <p>Lagerbestand</p>
                    <input
                        type="number"
                        id="item_stock"
                    />
                </div>

                {errorMessage && <p className="error">{errorMessage}</p>}

                <button className='btn_primary' onClick={addProduct}>Speichern</button>
                {/* <button className='btn_primary' onClick={allItems}>ShowAll</button> */}
                </div>
                <div className='message' id="message"></div>
            </form>
            <h4>Produkte bearbeiten</h4>
            <div className="edit_products">
                        {products.map((p) => (
                            <div className="product_card" key={p.item_id}>
                                <div className="product_card_details">
                                    <div className="product_card_name">{p.item_name}</div>
                                    <div className="product_card_size">{p.item_size}</div>
                                    <div className="product_card_summary">{p.item_sum}</div>
                               </div> 
                               <div className="product_card_stock">{p.item_stock}</div>
                               <input id={"input"+p.item_id} type="number" className="editInput"></input>
                                <div className="product_card_delete">
                                    <button onClick={() => deleteProduct(p.item_id)}>
                                    <img src={trash} alt=""></img>
                                    </button>
                                    <button onClick={() => editStock(p.item_id)}>
                                    <img src={edit} alt=""></img>
                                    </button>
                                </div>
                            </div>
                        ))}

                <button className="product_card_save" onClick={saveChanges}>Speichern</button>
            </div>
            {/* <p>SERVER RESPONSE MESSAGE: {msg}</p> */}
        </div>
    </div>
);

}

export default Edit;
