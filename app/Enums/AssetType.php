<?php

namespace App\Enums;

enum AssetType: string
{
    case Vehicle = 'vehicle';
    case Electronics = 'electronics';
    case Property = 'property';
    case Jewelry = 'jewelry';
    case Other = 'other';
}
