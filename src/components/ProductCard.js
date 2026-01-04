import React, { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Rating,
  Tooltip,
  Badge,
  useTheme,
} from "@mui/material";
import {
  AddShoppingCart,
  Favorite,
  FavoriteBorder,
  Visibility,
  Share,
  LocalOffer,
} from "@mui/icons-material";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
import { getRemainingTime } from "../data/mockData";

const ProductCard = ({ product, onQuickView }) => {
  const theme = useTheme();
  const { addItem, isInCart, getItemQuantity } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Actualizar countdown si el producto tiene descuento con tiempo límite
  useEffect(() => {
    if (product.discountEndTime) {
      const updateCountdown = () => {
        const remaining = getRemainingTime(product.discountEndTime);
        setTimeRemaining(remaining);
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    }
  }, [product.discountEndTime]);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.shortDescription,
        url: window.location.origin + `/producto/${product.id}`,
      });
    } else {
      // Fallback para navegadores que no soporten Web Share API
      navigator.clipboard.writeText(
        window.location.origin + `/producto/${product.id}`
      );
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const formatTime = (time) => {
    if (!time || time.isExpired) return null;

    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.75rem" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "white" }}>
            {time.days.toString().padStart(2, "0")}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
            días
          </Typography>
        </Box>
        <Typography sx={{ color: "white" }}>:</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "white" }}>
            {time.hours.toString().padStart(2, "0")}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
            hrs
          </Typography>
        </Box>
        <Typography sx={{ color: "white" }}>:</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: 600, color: "white" }}>
            {time.minutes.toString().padStart(2, "0")}
          </Typography>
          <Typography variant="caption" sx={{ fontSize: "0.6rem", opacity: 0.8 }}>
            min
          </Typography>
        </Box>
      </Box>
    );
  };

  const inCartQuantity = getItemQuantity(product.id);
  const discountPercentage = product.discount || 0;
  const finalPrice = product.price;
  const originalPrice = product.originalPrice;

  return (
    <Card
      component={Link}
      to={`/producto/${product.id}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        textDecoration: "none",
        color: "inherit",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          "& .product-image": {
            transform: "scale(1.05)",
          },
          "& .quick-actions": {
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        "&:active": {
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Badges */}
      <Box sx={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
        {discountPercentage > 0 && (
          <Chip
            icon={<LocalOffer sx={{ fontSize: 16 }} />}
            label={`-${discountPercentage}%`}
            size="small"
            sx={{
              backgroundColor: theme.palette.error.main,
              color: "white",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(244, 67, 54, 0.3)",
              mb: 0.5,
              display: "block",
            }}
          />
        )}

        {!product.inStock && (
          <Chip
            label="Agotado"
            size="small"
            sx={{
              backgroundColor: theme.palette.grey[600],
              color: "white",
              fontWeight: 600,
            }}
          />
        )}

        {product.inStock && product.stock <= 5 && (
          <Chip
            label={`Solo ${product.stock}`}
            size="small"
            sx={{
              backgroundColor: theme.palette.warning.main,
              color: "white",
              fontWeight: 600,
            }}
          />
        )}
      </Box>

      {/* Countdown Timer */}
      {timeRemaining && !timeRemaining.isExpired && (
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            backgroundColor: "rgba(244, 67, 54, 0.9)",
            borderRadius: "8px",
            p: 1,
            backdropFilter: "blur(10px)",
          }}
        >
          {formatTime(timeRemaining)}
        </Box>
      )}

      {/* Quick Actions */}
      <Box
        className="quick-actions"
        sx={{
          position: "absolute",
          top: "50%",
          right: 12,
          transform: "translateY(-50%) translateY(10px)",
          opacity: 0,
          transition: "all 0.3s ease",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Tooltip title={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}>
          <IconButton
            onClick={handleToggleFavorite}
            sx={{
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: theme.palette.secondary.main,
                color: "white",
              },
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </Tooltip>

        <Tooltip title="Vista rápida">
          <IconButton
            onClick={handleQuickView}
            sx={{
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: theme.palette.primary.main,
                color: "white",
              },
            }}
          >
            <Visibility />
          </IconButton>
        </Tooltip>

        <Tooltip title="Compartir">
          <IconButton
            onClick={handleShare}
            sx={{
              backgroundColor: "white",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              "&:hover": {
                backgroundColor: theme.palette.info.main,
                color: "white",
              },
            }}
          >
            <Share />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Product Image */}
      <Box sx={{ position: "relative", paddingTop: "75%", overflow: "hidden" }}>
        <CardMedia
          component="img"
          image={
            imageError || !product.images || product.images.length === 0
              ? "https://via.placeholder.com/300x225/f5f5f5/666?text=Imagen+no+disponible"
              : product.images[0]
          }
          alt={product.name}
          onError={() => setImageError(true)}
          className="product-image"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
          }}
        />
      </Box>

      {/* Product Info */}
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 0.5, textTransform: "uppercase", fontSize: "0.75rem" }}
        >
          {product.category}
        </Typography>

        <Typography
          variant="h6"
          component="h3"
          sx={{
            mb: 1,
            fontWeight: 600,
            fontSize: "1rem",
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {product.shortDescription}
        </Typography>

        {/* Rating */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Rating
            value={product.rating}
            precision={0.1}
            size="small"
            readOnly
            sx={{ mr: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            ({product.reviewCount})
          </Typography>
        </Box>

        {/* Price */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "1.25rem" }}
          >
            S/ {finalPrice}
          </Typography>

          {originalPrice && originalPrice > finalPrice && (
            <Typography
              variant="body2"
              sx={{
                textDecoration: "line-through",
                color: "text.secondary",
                fontSize: "0.9rem",
              }}
            >
              S/ {originalPrice}
            </Typography>
          )}
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          variant="contained"
          fullWidth
          startIcon={
            inCartQuantity > 0 ? (
              <Badge badgeContent={inCartQuantity} color="secondary">
                <AddShoppingCart />
              </Badge>
            ) : (
              <AddShoppingCart />
            )
          }
          onClick={handleAddToCart}
          disabled={!product.inStock}
          sx={{
            borderRadius: "10px",
            py: 1.2,
            fontWeight: 600,
            textTransform: "none",
            background: product.inStock
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : theme.palette.grey[400],
            "&:hover": product.inStock
              ? {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              }
              : {},
          }}
        >
          {!product.inStock
            ? "Agotado"
            : inCartQuantity > 0
              ? "Agregar más"
              : "Agregar al carrito"}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;
