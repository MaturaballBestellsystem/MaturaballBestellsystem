import React from 'react';
import './CSS/item.css';

const Item = ({ name, size, stock, img, onClick }) => {
    const image = require(`./thumbnails/${img}`);
  
    return (
      <div className='item' onClick={onClick}>
        <div className='item_card'>
                  <img id='item_img_card' src={image} alt={name} loading="lazy"></img>
                  {stock>0 ?
                    <p id='items_left'>{stock}</p> :
                    <p id='items_left_soldout'>Ausverkauft</p>
                  }      
        </div>
        <p id='item_size'>{size}</p>
        <p id='item_title'>{name}</p>
       
    </div>
    );
  };
  

export default Item;