module.exports = (socket, io) => {
    // Join market updates room
    socket.on('join-market', (location) => {
        socket.join(`market-${location}`);
    });

    // Leave market updates room
    socket.on('leave-market', (location) => {
        socket.leave(`market-${location}`);
    });

    // Subscribe to price alerts
    socket.on('subscribe-price-alert', (data) => {
        const { commodity, targetPrice, condition } = data;
        socket.join(`price-alert-${commodity}`);

        // Store alert preferences 
        socket.priceAlerts = socket.priceAlerts || {};
        socket.priceAlerts[commodity] = { targetPrice, condition};
    });

    // Unsubscribe from price alerts
    socket.on('unsubscribe-price-alert', (commodity) =>{
        socket.leave(`price-alert-${commodity}`);
        if(socket.priceAlerts){
            delete socket.priceAlerts[commodity];
        }
    });

    // Broadcast price updates
    socket.on('price-update', (data) => {
        const { commodity, price, market, location } = data;

        // Emit to market room
        io.to(`market-${location}`).emit('market-price-yupdate', {
            commodity,
            price,
            market,
            timestamp: new Date()
        });

        // Check price alerts
        io.to(`price-alert-${commodity}`).emit('price-alert',{
            commodity,
            currentPrice: price,
            market,
            timestamp: new Date()
        });
    });
};