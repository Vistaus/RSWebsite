<?php
	$stationId = trim($_GET['stationId']);
	$countryCode = trim($_GET['countryCode']);
	$stationName = 'Station nicht gefunden';
	$stationPhoto = 'images/default.jpg';
	$photoCaption = $stationName;
	$photographer = 'n.a.';
	$photographerUrl = '';
	$license = 'n.a.';
	$licenseUrl = '';
	$uploadUrl = '';

	try {
		$opts = [
			"http" => [
				"method" => "GET",
				"header" => "Accept-language: " . $_SERVER['HTTP_ACCEPT_LANGUAGE']
			]
		];

		$context = stream_context_create($opts);

		$json = file_get_contents('https://api.railway-stations.org/'.$countryCode.'/stations/'.$stationId, false, $context);
		if ($json !== false) {
			$data = json_decode($json, true);
			if (isset($data)) {
				$stationName = $data['title'];
				$photographer = $data['photographer'];
				if (isset($photographer)) {
					$stationPhoto = $data['photoUrl'];
					$photographerUrl = $data['photographerUrl'];
					$license = $data['license'];
					$licenseUrl = $data['licenseUrl'];
					$photoCaption = $stationName;
				} else {
					$photoCaption = 'Hier fehlt noch ein Foto';
					$photographer = 'n.a.';
					$uploadUrl = 'upload.html?countryCode='.$countryCode.'&stationId='.$stationId.'&title='.$stationName;
				}
			}
		}
	} catch (Exception $e) {
	    $photoCaption = 'Fehler beim Laden der Station';
	}
?>
<!doctype html>
<html lang="de-DE" xmlns="http://www.w3.org/1999/xhtml" xmlns:fb="http://ogp.me/ns/fb#">
  <head>
		<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
		<meta property="og:image" content="<?php echo htmlspecialchars($stationPhoto);?>" />
		<title><?php echo htmlspecialchars($stationName);?> - RailwayStations</title>

    <!-- Bootstrap core CSS -->
		<link href="bootstrap-4.3.1-dist/css/bootstrap.min.css" rel="stylesheet">

		<link rel="apple-touch-icon" sizes="57x57" href="./images/apple-icon-57x57.png">
		<link rel="apple-touch-icon" sizes="60x60" href="./images/apple-icon-60x60.png">
		<link rel="apple-touch-icon" sizes="72x72" href="./images/apple-icon-72x72.png">
		<link rel="apple-touch-icon" sizes="76x76" href="./images/apple-icon-76x76.png">
		<link rel="apple-touch-icon" sizes="114x114" href="./images/apple-icon-114x114.png">
		<link rel="apple-touch-icon" sizes="120x120" href="./images/apple-icon-120x120.png">
		<link rel="apple-touch-icon" sizes="144x144" href="./images/apple-icon-144x144.png">
		<link rel="apple-touch-icon" sizes="152x152" href="./images/apple-icon-152x152.png">
		<link rel="apple-touch-icon" sizes="180x180" href="./images/apple-icon-180x180.png">
		<link rel="icon" type="image/png" sizes="192x192"  href="./images/android-icon-192x192.png">
		<link rel="icon" type="image/png" sizes="32x32" href="./images/favicon-32x32.png">
		<link rel="icon" type="image/png" sizes="96x96" href="./images/favicon-96x96.png">
		<link rel="icon" type="image/png" sizes="16x16" href="./images/favicon-16x16.png">

		<link href="css/all.min.css" rel="stylesheet">
		<link href="css/style.css" rel="stylesheet">

</head>
<body>

	<nav class="navbar navbar-expand-md navbar-dark fixed-top" style="background-color: #9F0C35;">
		<a class="navbar-brand" href="index.html" active>
	    <img src="images/logo_white.svg" width="30" height="30" class="d-inline-block align-top" alt="">
	    Railway<strong>Stations</strong>
	  </a>
		<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbar" aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
	    <span class="navbar-toggler-icon"></span>
	  </button>

	  <div class="collapse navbar-collapse" id="navbar">
	    <ul class="navbar-nav mr-auto">
				<li class="nav-item">
		      <a class="nav-link p-2" href="settings.html" rel="noopener" aria-label="Einstellungen" title="Einstellungen"><i class="fas fa-sliders-h"></i></a>
		    </li>
				<li class="nav-item">
		      <a class="nav-link p-2" href="faq.html" rel="noopener" aria-label="FAQ" title="FAQ"><i class="fas fa-question"></i></a>
		    </li>
				<li class="nav-item">
		      <a class="nav-link p-2" href="https://github.com/RailwayStations" rel="noopener" aria-label="Entwicklung" title="Entwicklung"><i class="fab fa-github"></i></a>
		    </li>
				<li class="nav-item">
		      <a class="nav-link p-2" href="impressum.html" rel="noopener" aria-label="Impressum" title="Impressum"><i class="fas fa-info"></i></a>
		    </li>
				<li class="nav-item">
		      <a class="nav-link p-2" href="datenschutz.html" rel="noopener" aria-label="Datenschutzerklärung" title="Datenschutzerklärung"><i class="fas fa-shield-alt"></i></a>
		    </li>
	    </ul>
	  </div>
	</nav>

<main role="main" class="col-12 bd-content station">

		<h2><?php echo htmlspecialchars($stationName);?></h2>

		<?php if ($uploadUrl == '') { ?>
					<p><small class=\"text-muted\">Fotograf: <a href="<?php echo htmlspecialchars($photographerUrl);?>" id="photographer-url"><span id="photographer"><?php echo htmlspecialchars($photographer);?></span></a>,
					Lizenz: <a href="<?php echo htmlspecialchars($licenseUrl);?>" id="license-url"><span id="license"><?php echo htmlspecialchars($license);?></span></a></small></p>
		<?php } else { ?>
					<p><a href="<?php echo htmlspecialchars($uploadUrl);?>" title="Eigenes Foto hochladen" data-ajax="false"><i class="fas fa-upload"></i> Lade Dein eigenes Foto hoch</i></a></p>
		<?php } ?>

		<img id="station-photo" class="img-fluid max-width: 100%;height: auto;" src="<?php echo htmlspecialchars($stationPhoto);?>" title="<?php echo htmlspecialchars($photoCaption);?>"/>

</main>

<script src="js/jquery-3.4.1.min.js"></script>
<script src="js/popper.min.js"></script>
<script src="bootstrap-4.3.1-dist/js/bootstrap.bundle.min.js"></script>

<script src="js/common.js"></script>
</body>
</html>
