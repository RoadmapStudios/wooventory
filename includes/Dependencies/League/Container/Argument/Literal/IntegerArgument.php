<?php

declare(strict_types=1);

namespace CommerceBird\Dependencies\League\Container\Argument\Literal;

use CommerceBird\Dependencies\League\Container\Argument\LiteralArgument;

class IntegerArgument extends LiteralArgument
{
    public function __construct(int $value)
    {
        parent::__construct($value, LiteralArgument::TYPE_INT);
    }
}
