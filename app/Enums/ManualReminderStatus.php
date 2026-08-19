<?php

namespace App\Enums;

enum ManualReminderStatus: string
{
    case Active = 'active';
    case Dismissed = 'dismissed';
    case Done = 'done';
}
