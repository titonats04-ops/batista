<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>E-Commerce | Home</title>

    <!-- Bootstrap 5 -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">

    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet">

    <!-- Custom CSS -->
    <style>
        body {
            font-family: "Poppins", sans-serif;
            background: #f5f6fa;
        }
        .navbar-brand {
            font-weight: 600;
            font-size: 1.4rem;
        }
        .hero-section {
            background: linear-gradient(135deg, #4e73df, #1cc88a);
            color: white;
            padding: 80px 0;
            border-radius: 20px;
        }
        .product-card {
            border: none;
            border-radius: 15px;
            transition: all 0.3s;
        }
        .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .footer {
            background: #2d2f36;
            color: #fff;
            padding: 30px 0;
        }
    </style>
</head>

<body>

    <!-- Shared header -->
    <?php include __DIR__ . '/header.php'; ?>

    <!-- HERO SECTION -->
    <div class="container mt-4">
        <div class="hero-section text-center">
            <h1 class="fw-bold">Shop the Latest Trends</h1>
            <p class="lead">Fast, reliable, and affordable online shopping experience.</p>
            <a href="products.php" class="btn btn-light btn-lg mt-3">Browse Products</a>
        </div>
    </div>

    <!-- PRODUCT PREVIEW SECTION -->
    <div class="container mt-5">
        <h2 class="fw-bold mb-4">Featured Products</h2>

        <div class="row g-4">

            <!-- Product Card -->
            <div class="col-md-3">
                <div class="card product-card">
                    <img src="https://via.placeholder.com/250" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">Sample Product</h5>
                        <p class="card-text text-muted">₱1,299.00</p>
                        <a href="#" class="btn btn-primary w-100">Add to Cart</a>
                    </div>
                </div>
            </div>

            <!-- Copy 3 more cards (demo) -->
            <div class="col-md-3">
                <div class="card product-card">
                    <img src="https://via.placeholder.com/250" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">Wireless Earbuds</h5>
                        <p class="card-text text-muted">₱799.00</p>
                        <a href="#" class="btn btn-primary w-100">Add to Cart</a>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card product-card">
                    <img src="https://via.placeholder.com/250" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">Smart Watch</h5>
                        <p class="card-text text-muted">₱1,199.00</p>
                        <a href="#" class="btn btn-primary w-100">Add to Cart</a>
                    </div>
                </div>
            </div>

            <div class="col-md-3">
                <div class="card product-card">
                    <img src="https://via.placeholder.com/250" class="card-img-top">
                    <div class="card-body">
                        <h5 class="card-title">Gaming Mouse</h5>
                        <p class="card-text text-muted">₱499.00</p>
                        <a href="#" class="btn btn-primary w-100">Add to Cart</a>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <!-- Shared footer -->
    <?php include __DIR__ . '/footer.php'; ?>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

</body>
</html>