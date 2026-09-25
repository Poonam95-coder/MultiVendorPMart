const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const DeliveryPartner = require("../models/DeliveryPartner");


// Get token from payload, socket auth, header or cookie
function extractToken(socket, payloadToken) {
    if (payloadToken) {
        return payloadToken;
    }

    if (socket.handshake.auth?.token) {
        return socket.handshake.auth.token;
    }

    const authHeader =
        socket.handshake.headers?.authorization;

    if (
        authHeader &&
        authHeader.startsWith("Bearer ")
    ) {
        return authHeader.slice(7);
    }

    // Check token stored in cookies
    if (socket.handshake.headers?.cookie) {
        const cookies =
            socket.handshake.headers.cookie
                .split(";")
                .reduce((acc, c) => {
                    const [k, v] = c.trim().split("=");

                    if (k && v) {
                        acc[k] = decodeURIComponent(v);
                    }

                    return acc;
                }, {});

        if (cookies.token) {
            return cookies.token;
        }
    }

    return null;
}


module.exports = (io) => {
    io.on("connection", (socket) => {

        // Authenticate socket and join role-based rooms
        try {
            const t = extractToken(socket, null);

            if (t) {
                const decoded = jwt.verify(
                    t,
                    process.env.JWT_SECRET
                );

                if (decoded.role === "delivery") {
                    socket.join(
                        `delivery:${decoded.id}`
                    );
                } else if (decoded.role === "admin") {
                    socket.join("admin:orders");
                }
            }
        } catch (e) {}


        // Join an order room after checking access
        const handleJoinOrder = async ({
            orderId,
            token
        }) => {
            try {
                if (
                    !orderId ||
                    !mongoose.Types.ObjectId.isValid(orderId)
                ) {
                    return;
                }

                const t = extractToken(socket, token);

                if (!t) {
                    return;
                }

                const decoded = jwt.verify(
                    t,
                    process.env.JWT_SECRET
                );

                const order = await Order.findById(orderId);

                if (!order) {
                    return;
                }


                const isOwner =
                    order.user &&
                    order.user.toString() === decoded.id;

                const isAdmin =
                    decoded.role === "admin";

                const isAssignedPartner =
                    decoded.role === "delivery" &&
                    order.deliveryPartner &&
                    order.deliveryPartner.toString() ===
                        decoded.id;


                // Only allowed users can join the order room
                if (
                    isOwner ||
                    isAdmin ||
                    isAssignedPartner
                ) {
                    socket.join(`order:${orderId}`);
                }
            } catch (err) {
                console.error(
                    "Socket join-order error:",
                    err.message
                );
            }
        };


        socket.on(
            "join-order",
            handleJoinOrder
        );

        socket.on(
            "track-order",
            handleJoinOrder
        );


        // Join delivery partner room
        socket.on(
            "join-delivery",
            ({ partnerId, token }) => {
                try {
                    const t = extractToken(
                        socket,
                        token
                    );

                    if (t) {
                        const decoded = jwt.verify(
                            t,
                            process.env.JWT_SECRET
                        );

                        if (
                            decoded.role === "delivery"
                        ) {
                            socket.join(
                                `delivery:${decoded.id}`
                            );
                        }
                    } else if (partnerId) {
                        socket.join(
                            `delivery:${partnerId}`
                        );
                    }
                } catch (e) {}
            }
        );


        // Leave an order tracking room
        socket.on(
            "leave-order",
            ({ orderId }) => {
                if (orderId) {
                    socket.leave(
                        `order:${orderId}`
                    );
                }
            }
        );


        // Update live location of delivery partner
        socket.on(
            "update-location",
            async ({
                orderId,
                lat,
                lng,
                accuracy,
                token
            }) => {
                try {
                    const latNum = Number(lat);
                    const lngNum = Number(lng);

                    if (
                        !orderId ||
                        isNaN(latNum) ||
                        isNaN(lngNum) ||
                        !mongoose.Types.ObjectId.isValid(
                            orderId
                        )
                    ) {
                        return;
                    }


                    const t = extractToken(
                        socket,
                        token
                    );

                    if (!t) {
                        return;
                    }

                    const decoded = jwt.verify(
                        t,
                        process.env.JWT_SECRET
                    );

                    // Only delivery partners can update location
                    if (decoded.role !== "delivery") {
                        return;
                    }


                    const partner =
                        await DeliveryPartner.findById(
                            decoded.id
                        );

                    if (
                        !partner ||
                        !partner.isActive
                    ) {
                        return;
                    }


                    // Make sure partner is assigned to this order
                    const order =
                        await Order.findOne({
                            _id: orderId,
                            deliveryPartner: partner._id
                        });

                    if (!order) {
                        return;
                    }


                    // Stop location updates after order completion
                    if (
                        order.status === "Delivered" ||
                        order.status === "Cancelled"
                    ) {
                        return;
                    }


                    order.liveLocation = {
                        lat: latNum,
                        lng: lngNum,
                        updatedAt: new Date()
                    };

                    await order.save();


                    // Send location update to order room
                    io.to(`order:${orderId}`).emit(
                        "location-update",
                        {
                            orderId:
                                order._id.toString(),
                            lat:
                                order.liveLocation.lat,
                            lng:
                                order.liveLocation.lng,
                            accuracy:
                                accuracy || null,
                            updatedAt:
                                order.liveLocation
                                    .updatedAt
                        }
                    );


                    io.to(`order:${orderId}`).emit(
                        "delivery:location:update",
                        {
                            orderId:
                                order._id.toString(),
                            deliveryPartnerId:
                                partner._id.toString(),
                            latitude:
                                order.liveLocation.lat,
                            longitude:
                                order.liveLocation.lng,
                            accuracy:
                                accuracy || null,
                            timestamp:
                                order.liveLocation
                                    .updatedAt
                        }
                    );
                } catch (err) {
                    console.error(
                        "Socket update-location error:",
                        err.message
                    );
                }
            }
        );
    });
};