function getIcons(keyword) {
    //e27bcb0d06f1b99f172d93c4d689c53319b5c456
    fetch(
        `https://api.iconfinder.com/v4/icons/search?query=${keyword}&count=10`,
        {
            method: "POST",
            headers: {
                Origin: "http://localhost",
                Authorization:
                    "Bearer jQVbXJAGrsOZ6dwiP5fcKvYeMfhBzMxftngJwoj1JTNVFCT6aXM3nFB3PWnYFFZ1",
                accept: "application/json",
            },
            body: {
                apikey: "e27bcb0d06f1b99f172d93c4d689c53319b5c456",
            },
        }
    )
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
        });
}

getIcons("Salami");
