-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : lun. 24 fév. 2025 à 19:49
-- Version du serveur : 5.7.39
-- Version de PHP : 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `chatboot`
--

-- --------------------------------------------------------

--
-- Structure de la table `admin`
--

CREATE TABLE `admin` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `prenom` varchar(255) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `date_naissance` date DEFAULT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `admin` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `chat_history`
--

CREATE TABLE `chat_history` (
  `id` int(11) NOT NULL,
  `message` text,
  `bot_response` text NOT NULL,
  `chat_id` varchar(11) NOT NULL,
  `user_ip` text,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sens` varchar(255) DEFAULT NULL,
  `is_bot` varchar(255) DEFAULT NULL,
  `date_upload` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` varchar(400) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `chat_history`
--

INSERT INTO `chat_history` (`id`, `message`, `bot_response`, `chat_id`, `user_ip`, `timestamp`, `sens`, `is_bot`, `date_upload`, `source`) VALUES
(1, 'bonjour', '', '1', '::ffff:127.0.0.1', '2024-12-26 12:32:14', 'IN', '0', '2024-12-26 12:32:14', 'localhost'),
(2, 'bonjour', '', '1', '::ffff:127.0.0.1', '2024-12-26 12:33:23', 'IN', '0', '2024-12-26 12:33:23', 'localhost'),
(3, 'bonjour', '', '1', '::ffff:127.0.0.1', '2024-12-26 12:34:27', 'IN', '0', '2024-12-26 12:34:26', 'localhost'),
(4, 'bonjour', '', '1', '::ffff:127.0.0.1', '2024-12-26 12:36:31', 'IN', '0', '2024-12-26 12:36:31', 'localhost'),
(5, 'bonjour', '', '1', '::ffff:127.0.0.1', '2024-12-26 12:42:28', 'IN', '0', '2024-12-26 12:42:28', 'localhost'),
(6, 'bonjour', '', '1', '::ffff:127.0.0.1', '2024-12-26 12:44:08', 'IN', '0', '2024-12-26 12:44:08', 'localhost'),
(7, 'Bonjour Comment puis-je vous aider?', ' ', '6', '::ffff:127.0.0.1', '2024-12-26 12:44:10', 'OUT', '1', '2024-12-26 12:44:09', 'localhost'),
(8, 'Bonejour', '', '1', '::ffff:127.0.0.1', '2024-12-26 12:49:49', 'IN', '0', '2024-12-26 12:49:49', 'localhost'),
(9, 'Bonjour Comment puis-je vous aider?', ' ', '8', '::ffff:127.0.0.1', '2024-12-26 12:49:50', 'OUT', '1', '2024-12-26 12:49:50', 'localhost'),
(10, 'bonjour', '', ' ', '::ffff:127.0.0.1', '2024-12-26 12:53:47', 'IN', '0', '2024-12-26 12:53:47', 'localhost'),
(11, 'Bonjour Comment puis-je vous aider?', ' ', '10', '::ffff:127.0.0.1', '2024-12-26 12:53:48', 'OUT', '1', '2024-12-26 12:53:48', 'localhost'),
(12, 'horraires', '', ' ', '::ffff:127.0.0.1', '2024-12-26 12:54:49', 'IN', '0', '2024-12-26 12:54:49', 'localhost'),
(13, 'nos horraires d\'ouverture du lundi au samedi de 9h à 20h.', ' ', '12', '::ffff:127.0.0.1', '2024-12-26 12:54:50', 'OUT', '1', '2024-12-26 12:54:50', 'localhost'),
(14, 'contacter service client', '', ' ', '::ffff:127.0.0.1', '2024-12-26 12:57:36', 'IN', '0', '2024-12-26 12:57:36', 'localhost'),
(15, 'Vous pouvez contacter notre service clientèle au numéro suivant : 201555.', ' ', '14', '::ffff:127.0.0.1', '2024-12-26 12:57:37', 'OUT', '1', '2024-12-26 12:57:37', 'localhost'),
(16, 'Bonsoir', '', ' ', '::ffff:127.0.0.1', '2025-01-27 18:36:51', 'IN', '0', '2025-01-27 18:36:51', 'localhost'),
(17, 'Bonsoir Comment puis-je vous aider?', ' ', '16', '::ffff:127.0.0.1', '2025-01-27 18:36:52', 'OUT', '1', '2025-01-27 18:36:52', 'localhost');

-- --------------------------------------------------------

--
-- Structure de la table `intents`
--

CREATE TABLE `intents` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tag` varchar(255) NOT NULL,
  `patterns` text,
  `responses` text,
  `source` varchar(255) NOT NULL,
  `text` text,
  `date_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `intents`
--

INSERT INTO `intents` (`id`, `tag`, `patterns`, `responses`, `source`, `text`, `date_created`) VALUES
(1, '', '', '', 'localhost', 'Bonjour  Comment puis-je vous aider?\r\nBonsoir  Comment puis-je vous aider?\r\nHi  que puis-je faire pour vous?\r\nHello  que puis-je faire pour vous?\r\nSalut Comment puis-je vous aider?\r\nVous pouvez contacter notre service clientèle au numéro suivant : 201555.\r\nnos horraires d\'ouverture du lundi au samedi de 9h à 20h.\r\nPour suivre votre commande, connectez-vous à votre compte en ligne ou appelez notre service client avec votre numéro de commande.\r\nNous offrons un support technique par téléphone, chat en ligne et e-mail. Choisissez l\'option qui vous convient le mieux.\r\nPour annuler un abonnement, veuillez contacter notre service clientèle et fournir les détails nécessaires.\r\nLes délais de livraison standard varient en fonction de votre emplacement. Vous pouvez obtenir des informations spécifiques en consultant notre site Web ou en appelant le service client.\r\nPour réinitialiser votre mot de passe, accédez à la page de connexion en ligne et suivez les instructions de réinitialisation du mot de passe.\r\nConsultez notre site Web ou appelez notre centre d\'appel pour connaître les promotions ou remises en cours.\r\nNous apprécions vos commentaires. Vous pouvez remplir notre enquête en ligne ou demander à parler à un responsable du service client.\r\nNous acceptons les paiements par carte de crédit, virement bancaire et d\'autres méthodes. Consultez notre site Web ou appelez notre service client pour plus de détails.', '2024-12-25 18:17:41'),
(2, '', '', '', '172.16.10.6', 'Bonjour, que puis-je faire pour vous?\r\nBonjour, que puis-je faire pour vous?\r\nHi que puis-je faire pour vous aujourd\'hui ?\r\nHello que puis-je faire pour vous aujourd\'hui?\r\nVous pouvez contacter notre service clientèle au numéro suivant : 301006666.\r\nnos horraires d\'ouverture c\'est 24h/24 7j/7.\r\nPour suivre votre commande, connectez-vous à votre compte en ligne ou appelez notre service client avec votre numéro de commande.\r\nNous offrons un support technique par téléphone, chat en ligne et e-mail. Choisissez l\'option qui vous convient le mieux.\r\nPour annuler un abonnement, veuillez contacter notre service clientèle et fournir les détails nécessaires.\r\nLes délais de livraison standard varient en fonction de votre emplacement. Vous pouvez obtenir des informations spécifiques en consultant notre site Web ou en appelant le service client.\r\nPour réinitialiser votre mot de passe, accédez à la page de connexion en ligne et suivez les instructions de réinitialisation du mot de passe.\r\nConsultez notre site Web ou appelez notre centre d\'appel pour connaître les promotions ou remises en cours.\r\nNous apprécions vos commentaires. Vous pouvez remplir notre enquête en ligne ou demander à parler à un responsable du service client.\r\nNous acceptons les paiements par carte de crédit, virement bancaire et d\'autres méthodes. Consultez notre site Web ou appelez notre service client pour plus de détails.', '2024-12-25 18:19:04');

-- --------------------------------------------------------

--
-- Structure de la table `personne`
--

CREATE TABLE `personne` (
  `id` int(11) NOT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `nom` varchar(30) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `username` varchar(40) DEFAULT NULL,
  `password` varchar(30) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Index pour la table `chat_history`
--
ALTER TABLE `chat_history`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `intents`
--
ALTER TABLE `intents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Index pour la table `personne`
--
ALTER TABLE `personne`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `chat_history`
--
ALTER TABLE `chat_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT pour la table `intents`
--
ALTER TABLE `intents`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `personne`
--
ALTER TABLE `personne`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
