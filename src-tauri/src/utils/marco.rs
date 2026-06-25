#[macro_export]
macro_rules! optional_struct {
    (
        $(#[$outer:meta])*
        $v1:vis struct $name:ident {
            $(
                $v2:vis $field:ident: $ty:ty,
            )*
        }
    ) => {
        $(#[$outer])*
        $v1 struct $name {
            $(
                $v2 $field: Option<$ty>,
            )*
        }
    };
}
