IF DB_ID(N'InventoryDb') IS NULL
    CREATE DATABASE InventoryDb;
GO

USE InventoryDb;
GO

IF OBJECT_ID(N'dbo.Transactions', N'U') IS NOT NULL DROP TABLE dbo.Transactions;
IF OBJECT_ID(N'dbo.Products', N'U') IS NOT NULL DROP TABLE dbo.Products;
GO

CREATE TABLE dbo.Products
(
    Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Products PRIMARY KEY,
    Name        NVARCHAR(100)     NOT NULL,
    Description NVARCHAR(500)     NOT NULL,
    Category    NVARCHAR(50)      NOT NULL,
    ImageUrl    NVARCHAR(500)     NOT NULL,
    Price       DECIMAL(18,2)     NOT NULL CONSTRAINT CK_Products_Price CHECK (Price > 0),
    Stock       INT               NOT NULL CONSTRAINT CK_Products_Stock CHECK (Stock >= 0)
);
GO

CREATE TABLE dbo.Transactions
(
    Id              INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Transactions PRIMARY KEY,
    TransactionDate DATETIME2(0)      NOT NULL,
    Type            NVARCHAR(10)      NOT NULL CONSTRAINT CK_Transactions_Type CHECK (Type IN (N'Purchase', N'Sale')),
    ProductId       INT               NOT NULL,
    Quantity        INT               NOT NULL CONSTRAINT CK_Transactions_Quantity CHECK (Quantity > 0),
    UnitPrice       DECIMAL(18,2)     NOT NULL CONSTRAINT CK_Transactions_UnitPrice CHECK (UnitPrice > 0),
    TotalPrice      DECIMAL(18,2)     NOT NULL CONSTRAINT CK_Transactions_TotalPrice CHECK (TotalPrice > 0),
    Detail          NVARCHAR(500)     NULL
);
GO

CREATE INDEX IX_Transactions_ProductId_TransactionDate
    ON dbo.Transactions (ProductId, TransactionDate);
GO

INSERT INTO dbo.Products (Name, Description, Category, ImageUrl, Price, Stock)
VALUES
    (N'Laptop Lenovo ThinkPad E14', N'Intel Core i5, 16 GB RAM, 512 GB SSD',  N'Computadoras',   N'https://placehold.co/200x200?text=Laptop',    899.99, 10),
    (N'Mouse inalámbrico M185',     N'Mouse inalámbrico USB',                N'Accesorios',     N'https://placehold.co/200x200?text=Mouse',      15.50, 50),
    (N'Teclado mecánico K552',      N'Teclado mecánico retroiluminado',      N'Accesorios',     N'https://placehold.co/200x200?text=Teclado',    45.00, 25),
    (N'Monitor 24" Full HD',        N'Monitor IPS 75 Hz',                    N'Monitores',      N'https://placehold.co/200x200?text=Monitor',   159.90,  8),
    (N'Impresora Epson L3250',      N'Multifuncional de tinta continua',     N'Impresoras',     N'https://placehold.co/200x200?text=Impresora', 229.00,  5),
    (N'Disco SSD 1 TB',             N'SSD NVMe M.2',                         N'Almacenamiento', N'https://placehold.co/200x200?text=SSD',        79.99, 15),
    (N'Audífonos Bluetooth',        N'Audífonos inalámbricos con micrófono', N'Accesorios',     N'https://placehold.co/200x200?text=Audifonos',  35.00, 30),
    (N'Webcam HD 1080p',            N'Cámara web con micrófono integrado',   N'Accesorios',     N'https://placehold.co/200x200?text=Webcam',     29.90, 12);
GO
