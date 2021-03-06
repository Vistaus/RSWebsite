<!doctype html>
<html lang="de-DE">
<head>
    <?php
    require_once "./header.php";
    $title = L::passwordUpdate_title;
    $info = L::passwordUpdate_info;
    $mobileInfo = L::passwordUpdate_mobileInfo;
    $happy = L::passwordUpdate_happy;
    ?>
    <title><?php echo $title; ?> - RailwayStations</title>
</head>
<body>

<?php
require_once "./navbar.php";
navbar();
?>

<main role="main" class="col-12 col-md-9 col-xl-8 py-md-3 pl-md-5 bd-content">

    <div class="alert alert-success" role="alert">
        <h4 class="alert-heading"><?php echo $info; ?></b></h4>
        <p><?php echo $mobileInfo; ?></p>
        <hr>
        <p class="mb-0"><?php echo $happy; ?></p>
    </div>

</main>

<script src="assets/jquery/jquery.min.js"></script>
<script src="assets/popper/popper.min.js"></script>
<script src="assets/bootstrap/js/bootstrap.min.js"></script>

<script src="js/common.js"></script>
<script src="js/updatePassword.js"></script>
</body>
</html>
