-- Breeder table (existing)
CREATE TABLE breeder (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100),
    lastName VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(50),
    experienceYears INT,
    story TEXT,
    phone VARCHAR(20),
    profile_image LONGBLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Grumbles table (parent dogs)
CREATE TABLE grumble (
    id INT PRIMARY KEY AUTO_INCREMENT,
    breeder_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    color ENUM('black', 'fawn', 'apricot') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (breeder_id) REFERENCES breeder(id),
    INDEX idx_breeder (breeder_id)
);

-- Litters table
CREATE TABLE litter (
    id INT PRIMARY KEY AUTO_INCREMENT,
    breeder_id INT NOT NULL,
    mom_id INT NOT NULL,
    dad_id INT NOT NULL,
    birth_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (breeder_id) REFERENCES breeder(id),
    FOREIGN KEY (mom_id) REFERENCES grumble(id),
    FOREIGN KEY (dad_id) REFERENCES grumble(id),
    INDEX idx_parents (mom_id, dad_id)
);

-- Puppies table
CREATE TABLE puppy (
    id INT PRIMARY KEY AUTO_INCREMENT,
    litter_id INT NOT NULL,
    breeder_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    color ENUM('black', 'fawn', 'apricot') NOT NULL,
    status ENUM('available', 'reserved') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (litter_id) REFERENCES litter(id),
    FOREIGN KEY (breeder_id) REFERENCES breeder(id),
    INDEX idx_litter (litter_id),
    INDEX idx_breeder (breeder_id)
);