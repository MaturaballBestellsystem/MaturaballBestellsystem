import React, { useState, useEffect } from 'react';
import "./CSS/order.css";

const Order = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/orders")
      .then((res) => res.json())
      .then((json) => {
        for (var i = 0; i < json.length; i++) {
          json[i].order_itemsjson = JSON.parse(json[i].order_itemsjson)
        }
        console.log(json);
        setOrders(json);
      })
      .catch((err) => console.log(err));
  }, []);

  const assignOrder = (orderId) => {
    fetch(`http://localhost:3001/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_assigned: 1,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setOrders((prevOrders) => {
            return prevOrders.map((order) => {
              if (order.order_id === orderId) {
                order.order_assigned = 1;
              }
              return order;
            });
          });
        } else {
          throw new Error('Failed to assign order');
        }
      })
      .catch((err) => console.log(err));
  };

  const unassignOrder = (orderId) => {
    fetch(`http://localhost:3001/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        order_assigned: 0,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setOrders((prevOrders) => {
            return prevOrders.map((order) => {
              if (order.order_id === orderId) {
                order.order_assigned = 0;
              }
              return order;
            });
          });
        } else {
          throw new Error('Failed to unassign order');
        }
      })
      .catch((err) => console.log(err));
  };

  const deleteOrder = (orderId) => {
    fetch(`http://localhost:3001/orders/${orderId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          setOrders((prevOrders) => {
            return prevOrders.filter((order) => order.order_id !== orderId);
          });
        } else {
          throw new Error('Failed to delete order');
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="order">
      <h4>Bestellungen</h4>
      <div className='order_wrap'>
        {orders != "" ? 
        <div className='order_table'>
           {orders.map((order) => (
            <div key={order.order_id} className="order_first_border">
              <div className="order_name">{order.order_usernm}</div>
              <div className='order_details'>
              <div className="order_quantity">
                {order.order_itemsjson.map((item) => (
                  <div key={item.item_id}>
                    <p>{item.quantity}</p>
                  </div>
                ))}
              </div>
              
              <div className="order_product">
                {order.order_itemsjson.map((item) => (
                  <div key={item.item_id}>
                    <p>{item.item_name}</p>
                  </div>
                ))}
              </div>
              </div>
              <div className="order_room"><p>Raum</p>{order.order_room}</div>
              <div className="order_status">{order.order_assigned ? <p className='order_assigned'>wird bearbeitet</p> : <p className='order_unassigned'>offen</p>}</div>
              <div>
                {order.order_assigned ? (
                  <div className="order_button">
                    <button className="order_button_assgn" onClick={() => unassignOrder(order.order_id)}>Zurücksetzen</button>
                    <button className="order_button_del" onClick={() => deleteOrder(order.order_id)}>Abschließen</button>
                  </div>
                ) : (
                  <button className="order_button_assgn" onClick={() => assignOrder(order.order_id)}>Bearbeiten</button>
                )}
              </div>
            </div>
          ))}
        </div> : "Keine offenen Bestellungen."}
      </div>
    </div>
  );
};

export default Order;