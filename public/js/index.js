// Enable pusher logging - don't include this in production
Pusher.logToConsole = true;

var pusher = new Pusher('13fcdedc78efac0503d7', {
  cluster: 'eu'
});

var channel = pusher.subscribe('orders');
channel.bind('new-order', function(data) {
  console.log(JSON.stringify(data));
});

//post new order to /api/orders/new
// {
//     name: "test",
//     ingredients: ["cheese", "salami"]
//     options: ["extra cheese", "calzone"]
// }
fetch("/api/orders/new", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        name: "test",
        ingredients: ["cheese", "salami"],
        options: ["extra cheese", "calzone"]
    })
})
.then(res=>res.json())
.then(data=>console.log(data))